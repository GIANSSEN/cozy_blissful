<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$appts = \App\Models\Appointment::all();
echo "TOTAL: " . $appts->count() . PHP_EOL;
foreach ($appts as $a) {
    echo "ID: {$a->id}, status: {$a->status}, datetime: {$a->datetime}, client_id: {$a->client_id}, therapist_id: {$a->therapist_id}, service_id: {$a->service_id}" . PHP_EOL;
}
