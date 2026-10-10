<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = Illuminate\Support\Facades\DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'");
foreach ($tables as $t) {
    $name = $t->table_name;
    $count = Illuminate\Support\Facades\DB::table($name)->count();
    echo "$name: $count\n";
}
