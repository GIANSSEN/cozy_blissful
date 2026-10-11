<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$admin = App\Models\User::role('admin')->first();
$token = $admin->createToken('test')->plainTextToken;
echo "Admin email: {$admin->email}\n";

$kernel = $app->make('Illuminate\Contracts\Http\Kernel');
$request = Illuminate\Http\Request::create('/api/admin/history', 'GET');
$request->headers->set('Authorization', 'Bearer ' . $token);
$request->headers->set('Accept', 'application/json');

$response = $kernel->handle($request);
echo "Status code: " . $response->getStatusCode() . "\n";
echo "Response snippet: " . substr($response->getContent(), 0, 300) . "\n";
$kernel->terminate($request, $response);
