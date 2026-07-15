<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigrateToPostgres extends Command
{
    /**
     * Pangalan ng command sa terminal.
     *
     * @var string
     */
    protected $signature = 'db:migrate-to-postgres
                            {--chunk=500 : Bilang ng rows na ililipat sa bawat batch}
                            {--skip-tables= : Comma-separated na mga tables na hindi ililipat (e.g. migrations,sessions)}
                            {--only-tables= : Comma-separated na mga tables LANG ang ililipat}
                            {--fresh : I-truncate ang lahat ng PG tables bago maglipat}';

    /**
     * Maikling paliwanag ng command.
     *
     * @var string
     */
    protected $description = 'Ilipat ang lahat ng data mula MySQL (DB_CONNECTION) papuntang PostgreSQL (pgsql connection).';

    /**
     * Mga tables na PALAGING hindi ililipat
     * (internal/runtime tables na hindi kailangan sa PG).
     */
    private const ALWAYS_SKIP = [
        'migrations',
    ];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $chunkSize   = (int) $this->option('chunk');
        $skipTables  = $this->parseList($this->option('skip-tables'));
        $onlyTables  = $this->parseList($this->option('only-tables'));
        $fresh       = (bool) $this->option('fresh');

        // ── 1. Kuhanin ang lahat ng tables sa MySQL ─────────────────────────
        $this->info('📋  Kukunin ang listahan ng tables sa MySQL…');

        $mysqlTables = DB::connection('mysql')
            ->select("SELECT table_name FROM information_schema.tables
                      WHERE table_schema = DATABASE()
                      ORDER BY table_name");

        $mysqlTables = array_map(fn ($r) => $r->table_name ?? $r->TABLE_NAME, $mysqlTables);

        // I-apply ang filters
        $tables = array_filter($mysqlTables, function (string $table) use ($skipTables, $onlyTables): bool {
            if (in_array($table, self::ALWAYS_SKIP, true)) {
                return false;
            }
            if (! empty($skipTables) && in_array($table, $skipTables, true)) {
                return false;
            }
            if (! empty($onlyTables) && ! in_array($table, $onlyTables, true)) {
                return false;
            }
            return true;
        });

        $tables = array_values($tables);
        $total  = count($tables);

        $this->info("✅  Nahanap: {$total} tables na ililipat.");
        $this->line('   ' . implode(', ', $tables));
        $this->newLine();

        if ($total === 0) {
            $this->warn('Walang tables na mililipat. Tapos na.');
            return self::SUCCESS;
        }

        // ── 2. I-run ang Laravel migrations sa PG para mabuo ang schema ──────
        $this->info('🏗   Nagtatakbo ng migrations sa PostgreSQL para mabuo ang schema…');
        $this->call('migrate', [
            '--database' => 'pgsql',
            '--force'    => true,
        ]);
        $this->newLine();

        // ── 3. Simulan ang data transfer ─────────────────────────────────────
        $pgPdo = DB::connection('pgsql')->getPdo();

        // I-disable ang FK checks sa PG gamit ang DEFERRED at SET session_replication_role
        $pgPdo->exec("SET session_replication_role = 'replica';");
        $this->info('🔓  Na-disable ang PostgreSQL FK checks (session_replication_role = replica).');
        $this->newLine();

        $progressBar = $this->output->createProgressBar($total);
        $progressBar->setFormat(' %current%/%max% [%bar%] %percent:3s%% — %message%');
        $progressBar->start();

        $errors = [];

        foreach ($tables as $table) {
            $progressBar->setMessage("Nililipat: {$table}");
            $progressBar->advance();

            try {
                // Optional na truncate bago mag-insert
                if ($fresh) {
                    DB::connection('pgsql')->statement("TRUNCATE TABLE \"{$table}\" RESTART IDENTITY CASCADE");
                }

                // Kuhanin ang column names mula MySQL para ma-map nang tama
                $columns = DB::connection('mysql')
                    ->getSchemaBuilder()
                    ->getColumnListing($table);

                $totalRows   = DB::connection('mysql')->table($table)->count();
                $transferred = 0;

                // Chunk-based transfer para hindi ma-exhaust ang memory
                DB::connection('mysql')
                    ->table($table)
                    ->orderBy($columns[0])        // palaging may ORDER para consistent ang chunking
                    ->chunk($chunkSize, function ($rows) use ($table, $columns, &$transferred) {
                        $rowsArray = $rows->map(fn ($row) => (array) $row)->toArray();

                        if (empty($rowsArray)) {
                            return;
                        }

                        // I-insert sa PG nang batch
                        DB::connection('pgsql')
                            ->table($table)
                            ->insert($rowsArray);

                        $transferred += count($rowsArray);
                    });

                // ── 4. I-reset ang sequences ng PG para walang ID conflict ───
                $this->resetSequence($pgPdo, $table, $columns);

            } catch (\Throwable $e) {
                $errors[$table] = $e->getMessage();
            }
        }

        $progressBar->finish();
        $this->newLine(2);

        // I-restore ang normal FK behavior sa PG
        $pgPdo->exec("SET session_replication_role = 'origin';");
        $this->info('🔒  Na-restore ang PostgreSQL FK checks.');
        $this->newLine();

        // ── 5. Ulat ng resulta ───────────────────────────────────────────────
        if (empty($errors)) {
            $this->info('🎉  Matagumpay na nailipat ang lahat ng tables sa PostgreSQL!');
        } else {
            $this->warn('⚠️   Natapos ang migration ngunit may mga errors sa ilang tables:');
            foreach ($errors as $table => $msg) {
                $this->error("   [{$table}] → {$msg}");
            }
        }

        return empty($errors) ? self::SUCCESS : self::FAILURE;
    }

    // ────────────────────────────────────────────────────────────────────────
    // Helpers
    // ────────────────────────────────────────────────────────────────────────

    /**
     * I-reset ang auto-increment sequence ng isang PG table.
     * Kailangan ito pagkatapos ng manual INSERT para hindi mag-conflict
     * ang susunod na auto-generated na ID.
     */
    private function resetSequence(\PDO $pgPdo, string $table, array $columns): void
    {
        // Hanapin kung mayroon bang 'id' column (o anumang serial/sequence column)
        $idColumn = in_array('id', $columns, true) ? 'id' : null;

        if ($idColumn === null) {
            return; // Walang auto-increment column, skip
        }

        try {
            // Hanapin ang sequence name na ginagamit ng column
            $stmt = $pgPdo->query(
                "SELECT pg_get_serial_sequence('\"{$table}\"', '{$idColumn}')"
            );
            $seqName = $stmt ? $stmt->fetchColumn() : null;

            if (! $seqName) {
                return; // Hindi sequence ang column, skip
            }

            // I-set ang sequence sa pinakamataas na existing ID + 1
            $pgPdo->exec(
                "SELECT setval('{$seqName}', COALESCE((SELECT MAX(\"{$idColumn}\") FROM \"{$table}\"), 0) + 1, false)"
            );
        } catch (\Throwable) {
            // Huwag pabagsakin ang buong migration dahil lang sa sequence error
        }
    }

    /**
     * I-parse ang comma-separated na string na option bilang array.
     */
    private function parseList(?string $value): array
    {
        if (empty($value)) {
            return [];
        }

        return array_map('trim', explode(',', $value));
    }
}
