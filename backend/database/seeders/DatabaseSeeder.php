<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Service;
use App\Models\Appointment;
use App\Models\TherapistAvailability;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles if they don't exist
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $therapistRole = Role::firstOrCreate(['name' => 'therapist', 'guard_name' => 'web']);
        $clientRole = Role::firstOrCreate(['name' => 'client', 'guard_name' => 'web']);

        // Create Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'System Administrator',
                'password' => bcrypt('password'),
            ]
        );
        $admin->syncRoles([$adminRole]);

        // Create Client User
        $client = User::firstOrCreate(
            ['email' => 'client@example.com'],
            [
                'name' => 'Jane Client',
                'password' => bcrypt('password'),
            ]
        );
        $client->syncRoles([$clientRole]);

        // Create Therapist Users
        $therapist1 = User::firstOrCreate(
            ['email' => 'therapist@example.com'],
            [
                'name' => 'John Therapist',
                'password' => bcrypt('password'),
            ]
        );
        $therapist1->syncRoles([$therapistRole]);

        $therapist2 = User::firstOrCreate(
            ['email' => 'maria@example.com'],
            [
                'name' => 'Maria Santos',
                'password' => bcrypt('password'),
            ]
        );
        $therapist2->syncRoles([$therapistRole]);

        $therapist3 = User::firstOrCreate(
            ['email' => 'sarah@example.com'],
            [
                'name' => 'Sarah Connor',
                'password' => bcrypt('password'),
            ]
        );
        $therapist3->syncRoles([$therapistRole]);

        $therapist4 = User::firstOrCreate(
            ['email' => 'ana@example.com'],
            [
                'name' => 'Ana Gomez',
                'password' => bcrypt('password'),
            ]
        );
        $therapist4->syncRoles([$therapistRole]);

        // Seed Services
        $services = [
            [
                'name' => 'Swedish Massage',
                'category' => 'Massage Therapy',
                'price' => 749.00,
                'duration' => 60,
                'image' => 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=500&q=80',
                'description' => 'Classic relaxing full-body massage with long, gliding strokes.'
            ],
            [
                'name' => 'Deep Tissue Massage',
                'category' => 'Massage Therapy',
                'price' => 849.00,
                'duration' => 60,
                'image' => 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=500&q=80',
                'description' => 'Firm pressure targeting deep muscle layers and chronic tension.'
            ],
            [
                'name' => 'Hilot Massage',
                'category' => 'Massage Therapy',
                'price' => 749.00,
                'duration' => 60,
                'image' => 'https://images.unsplash.com/photo-1519823551278-64ac928349d2?auto=format&fit=crop&w=500&q=80',
                'description' => 'Traditional Filipino healing massage using coconut oil.'
            ],
            [
                'name' => 'Traditional Massage',
                'category' => 'Massage Therapy',
                'price' => 749.00,
                'duration' => 60,
                'image' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=500&q=80',
                'description' => 'Standard relaxation massage using medium pressure.'
            ],
            [
                'name' => 'Thai Massage',
                'category' => 'Massage Therapy',
                'price' => 849.00,
                'duration' => 60,
                'image' => 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=500&q=80',
                'description' => 'Assisted stretching and acupressure for flexibility and relief.'
            ],
            [
                'name' => 'Post Natal Massage',
                'category' => 'Massage Therapy',
                'price' => 899.00,
                'duration' => 60,
                'image' => 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=500&q=80',
                'description' => 'Gentle restorative massage for mothers after childbirth.'
            ],
            [
                'name' => 'Hard Massage',
                'category' => 'Massage Therapy',
                'price' => 849.00,
                'duration' => 60,
                'image' => 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=500&q=80',
                'description' => 'Deep, intense pressure for serious muscle tension relief.'
            ],
            [
                'name' => 'Manicure',
                'category' => 'Nail Care',
                'price' => 299.00,
                'duration' => 30,
                'image' => 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=500&q=80',
                'description' => 'Professional manicure including shaping, cuticle care, and polish.'
            ],
            [
                'name' => 'Pedicure',
                'category' => 'Nail Care',
                'price' => 299.00,
                'duration' => 30,
                'image' => 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=500&q=80',
                'description' => 'Professional pedicure with soak, scrub, shaping, and polish.'
            ],
        ];

        foreach ($services as $srv) {
            Service::firstOrCreate(['name' => $srv['name']], $srv);
        }

        // Fetch spawned services to assign IDs
        $swedish = Service::where('name', 'Swedish Massage')->first();
        $deep = Service::where('name', 'Deep Tissue Massage')->first();
        $hilot = Service::where('name', 'Hilot Massage')->first();

        // Seed Therapist Availabilities
        // John Therapist: available today (11th) and tomorrow (12th)
        TherapistAvailability::firstOrCreate([
            'therapist_id' => $therapist1->id,
            'date' => Carbon::parse('2026-07-11')->format('Y-m-d')
        ]);
        TherapistAvailability::firstOrCreate([
            'therapist_id' => $therapist1->id,
            'date' => Carbon::parse('2026-07-12')->format('Y-m-d')
        ]);

        // Maria Santos: available today (11th) and next day (13th)
        TherapistAvailability::firstOrCreate([
            'therapist_id' => $therapist2->id,
            'date' => Carbon::parse('2026-07-11')->format('Y-m-d')
        ]);
        TherapistAvailability::firstOrCreate([
            'therapist_id' => $therapist2->id,
            'date' => Carbon::parse('2026-07-13')->format('Y-m-d')
        ]);

        // Sarah Connor: available tomorrow (12th) and next day (13th)
        TherapistAvailability::firstOrCreate([
            'therapist_id' => $therapist3->id,
            'date' => Carbon::parse('2026-07-12')->format('Y-m-d')
        ]);
        TherapistAvailability::firstOrCreate([
            'therapist_id' => $therapist3->id,
            'date' => Carbon::parse('2026-07-13')->format('Y-m-d')
        ]);

        // Ana Gomez: available today (11th)
        TherapistAvailability::firstOrCreate([
            'therapist_id' => $therapist4->id,
            'date' => Carbon::parse('2026-07-11')->format('Y-m-d')
        ]);

        // Seed Appointments
        // 1. Confirmed today, assigned to John Therapist
        Appointment::firstOrCreate([
            'client_id' => $client->id,
            'therapist_id' => $therapist1->id,
            'service_id' => $swedish->id,
            'datetime' => Carbon::parse('2026-07-11 14:00:00')->format('Y-m-d H:i:s'),
            'status' => 'Confirmed',
            'notes' => 'Prefers firm pressure on the shoulders. Lavender scent.',
        ]);

        // 2. Pending tomorrow (July 12th), unassigned
        Appointment::firstOrCreate([
            'client_id' => $client->id,
            'therapist_id' => null,
            'service_id' => $deep->id,
            'datetime' => Carbon::parse('2026-07-12 10:00:00')->format('Y-m-d H:i:s'),
            'status' => 'Pending',
            'notes' => 'Please request a therapist who specializes in lower back tension.',
        ]);

        // 3. Confirmed July 13th, assigned to Maria Santos
        Appointment::firstOrCreate([
            'client_id' => $client->id,
            'therapist_id' => $therapist2->id,
            'service_id' => $hilot->id,
            'datetime' => Carbon::parse('2026-07-13 15:30:00')->format('Y-m-d H:i:s'),
            'status' => 'Confirmed',
            'notes' => 'First time hilot customer.',
        ]);
    }
}
