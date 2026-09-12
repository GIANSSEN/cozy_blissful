<?php
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$secretKey = config('services.paymongo.secret_key');
$baseUrl   = config('services.paymongo.base_url', 'https://api.paymongo.com/v1');

echo "Base URL: " . $baseUrl . "\n";
echo "Secret Key prefix: " . substr($secretKey, 0, 10) . "...\n";

echo "\n--- Listing PayMongo Webhooks ---\n";
$whRes = Illuminate\Support\Facades\Http::withBasicAuth($secretKey, '')
    ->get($baseUrl . '/webhooks');
echo "Webhooks status: " . $whRes->status() . "\n";
echo "Webhooks body: " . $whRes->body() . "\n";

