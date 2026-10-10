<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== PRE-TRUNCATE BACKUP & VERIFICATION ===\n";

$backup = [
    'timestamp' => date('Y-m-d H:i:s'),
    'appointments' => DB::table('appointments')->get()->toArray(),
    'audit_logs' => DB::table('audit_logs')->get()->toArray(),
    'notifications' => DB::table('notifications')->get()->toArray(),
    'jobs' => DB::table('jobs')->get()->toArray(),
];

$backupPath = __DIR__ . '/database/backups/backup_before_truncate_' . date('Ymd_His') . '.json';
file_put_contents($backupPath, json_encode($backup, JSON_PRETTY_PRINT));
echo "Backup saved successfully to: $backupPath\n";
echo "Backed up: " . count($backup['appointments']) . " appointments, " 
    . count($backup['audit_logs']) . " audit logs, " 
    . count($backup['notifications']) . " notifications, "
    . count($backup['jobs']) . " jobs.\n\n";

echo "=== TRUNCATING BOOKINGS, HISTORY, AUDIT LOGS, NOTIFICATIONS ===\n";
DB::statement('TRUNCATE TABLE notifications, appointments, audit_logs, jobs, failed_jobs RESTART IDENTITY CASCADE');
echo "Truncate executed successfully.\n\n";

echo "=== POST-TRUNCATE STATUS CHECK ===\n";
$tables = [
    'appointments' => DB::table('appointments')->count(),
    'audit_logs' => DB::table('audit_logs')->count(),
    'notifications' => DB::table('notifications')->count(),
    'jobs' => DB::table('jobs')->count(),
    'failed_jobs' => DB::table('failed_jobs')->count(),
    'services (PRESERVED)' => DB::table('services')->count(),
    'users (PRESERVED)' => DB::table('users')->count(),
    'therapist_availabilities (PRESERVED)' => DB::table('therapist_availabilities')->count(),
    'roles (PRESERVED)' => DB::table('roles')->count(),
    'permissions (PRESERVED)' => DB::table('permissions')->count(),
];

foreach ($tables as $name => $count) {
    echo "$name: $count\n";
}

echo "\nDone!\n";
