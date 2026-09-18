<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Spatie\Permission\Models\Role;

$role = Role::firstOrCreate(['name' => 'therapist', 'guard_name' => 'web']);

$specialists = [
    ['name' => 'Jacky Adlawan', 'email' => 'jacky@example.com'],
    ['name' => 'Quenay Samson',  'email' => 'quenay@example.com'],
    ['name' => 'Lily Hermosa',   'email' => 'lily@example.com'],
    ['name' => 'Jade Ferrer',    'email' => 'jade@example.com'],
    ['name' => 'Allysa Banlaoi', 'email' => 'allysa@example.com'],
];

foreach ($specialists as $s) {
    $u = User::firstOrCreate(
        ['email' => $s['email']],
        ['name' => $s['name'], 'password' => bcrypt('password')]
    );
    $u->name = $s['name'];
    $u->password = bcrypt('password');
    $u->save();
    $u->syncRoles([$role]);
}

// Remove old mock therapists from database if needed or update their roles
$oldMock = [
    'ana@example.com', 'sarah@example.com', 'therapist@example.com', 'maria@example.com',
    'jacky.adlawan@cozyblissful.com', 'quenay.samson@cozyblissful.com', 'lily.hermosa@cozyblissful.com',
    'jade.ferrer@cozyblissful.com', 'allysa.banlaoi@cozyblissful.com'
];
User::whereIn('email', $oldMock)->delete();

echo "Specialists seeded successfully.\n";
