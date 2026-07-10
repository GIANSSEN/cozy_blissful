<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles
        $adminRole = Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $therapistRole = Role::create(['name' => 'therapist', 'guard_name' => 'web']);
        $clientRole = Role::create(['name' => 'client', 'guard_name' => 'web']);

        // Create Admin User
        $admin = User::create([
            'name' => 'System Administrator',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);
        $admin->assignRole($adminRole);

        // Create Therapist User
        $therapist = User::create([
            'name' => 'John Therapist',
            'email' => 'therapist@example.com',
            'password' => bcrypt('password'),
        ]);
        $therapist->assignRole($therapistRole);

        // Create Client User
        $client = User::create([
            'name' => 'Jane Client',
            'email' => 'client@example.com',
            'password' => bcrypt('password'),
        ]);
        $client->assignRole($clientRole);
    }
}
