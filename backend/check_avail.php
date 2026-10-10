<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$rows = Illuminate\Support\Facades\DB::table('therapist_availabilities')->get();
echo "Therapist availabilities count: " . count($rows) . "\n";
foreach ($rows->take(5) as $r) {
    echo json_encode($r) . "\n";
}
