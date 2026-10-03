<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Testing DB connection...\n";
    \DB::connection()->getPdo();
    echo "DB connected successfully!\n";

    echo "Testing AdminController::getHistory()...\n";
    $controller = app(\App\Http\Controllers\API\AdminController::class);
    $res = $controller->getHistory();
    echo "getHistory Status: " . $res->status() . "\n";
    $data = $res->getData(true);
    echo "History count: " . count($data['history'] ?? []) . "\n";
    echo "First 2 records:\n";
    print_r(array_slice($data['history'] ?? [], 0, 2));

    echo "\nTesting AdminController::getAppointments()...\n";
    $resAppt = $controller->getAppointments();
    echo "getAppointments Status: " . $resAppt->status() . "\n";
    $dataAppt = $resAppt->getData(true);
    echo "Appointments count: " . count($dataAppt['appointments'] ?? []) . "\n";

    echo "\nTesting Appointment query directly...\n";
    $count = \App\Models\Appointment::count();
    echo "Total appointments: $count\n";
    $statuses = \App\Models\Appointment::select('status', \DB::raw('count(*) as total'))->groupBy('status')->get();
    foreach ($statuses as $s) {
        echo "- {$s->status}: {$s->total}\n";
    }

} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "TRACE:\n" . $e->getTraceAsString() . "\n";
}
