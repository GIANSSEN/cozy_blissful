<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $c = new App\Http\Controllers\API\AdminController();
    $historyRes = $c->getHistory();
    $historyData = json_decode($historyRes->getContent(), true);
    echo "GET_HISTORY: SUCCESS (count=" . count($historyData['history']) . ")\n";

    $apptRes = $c->getAppointments();
    $apptData = json_decode($apptRes->getContent(), true);
    echo "GET_APPOINTMENTS: SUCCESS (count=" . count($apptData['appointments']) . ")\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . " at " . $e->getFile() . ":" . $e->getLine() . "\n";
}
