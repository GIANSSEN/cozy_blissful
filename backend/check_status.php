<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "--- USERS ---\n";
foreach (Illuminate\Support\Facades\DB::table('users')->select('id', 'name', 'email')->get() as $u) {
    echo "ID: {$u->id} | Name: {$u->name} | Email: {$u->email}\n";
}

echo "\n--- APPOINTMENTS ---\n";
echo "Total appointments: " . Illuminate\Support\Facades\DB::table('appointments')->count() . "\n";
$statuses = Illuminate\Support\Facades\DB::table('appointments')->select('status', Illuminate\Support\Facades\DB::raw('count(*) as count'))->groupBy('status')->get();
foreach ($statuses as $s) {
    echo "Status {$s->status}: {$s->count}\n";
}

echo "\n--- AUDIT LOGS ---\n";
echo "Total audit logs: " . Illuminate\Support\Facades\DB::table('audit_logs')->count() . "\n";

echo "\n--- NOTIFICATIONS ---\n";
echo "Total notifications: " . Illuminate\Support\Facades\DB::table('notifications')->count() . "\n";

echo "\n--- THERAPIST AVAILABILITIES ---\n";
echo "Total therapist availabilities: " . Illuminate\Support\Facades\DB::table('therapist_availabilities')->count() . "\n";

echo "\n--- SERVICES (Landing page catalog) ---\n";
echo "Total services: " . Illuminate\Support\Facades\DB::table('services')->count() . "\n";
