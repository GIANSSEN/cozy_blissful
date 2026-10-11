<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$controller = new App\Http\Controllers\API\AdminController();
$resp = $controller->getHistory();
$data = json_decode($resp->getContent(), true);

echo "Total history items returned: " . count($data['history']) . "\n";
foreach ($data['history'] as $item) {
    echo "ID: " . $item['id'] . " | Service: " . $item['service'] . " | Count: " . ($item['services_count'] ?? 1) . " | Multi: " . ($item['is_multi_service'] ? 'yes' : 'no') . "\n";
    if (!empty($item['appointment_ids'])) {
        echo "   IDs: " . json_encode($item['appointment_ids']) . "\n";
    }
}
