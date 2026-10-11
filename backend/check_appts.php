<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$appts = App\Models\Appointment::with(['service', 'client'])->whereIn('id', [8, 9, 10, 11, 12, 13, 14, 15, 16])->get();
foreach ($appts as $a) {
    echo "ID: {$a->id} | Group: '{$a->booking_group_id}' | Status: '{$a->status}' | Service: " . ($a->service ? $a->service->name : 'none') . " | DT: {$a->datetime}\n";
}
