<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\TherapistAvailability;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class StaffSeeder extends Seeder
{
    const DEFAULT_PASSWORD = 'password';

    public function run(): void
    {
        $therapistRole = Role::firstOrCreate(['name' => 'therapist', 'guard_name' => 'web']);

        $oldEmails = [
            'therapist@example.com',
            'maria@example.com',
            'sarah@example.com',
            'ana@example.com',
            'jacky.adlawan@cozyblissful.com',
            'quenay.samson@cozyblissful.com',
            'lily.hermosa@cozyblissful.com',
            'jade.ferrer@cozyblissful.com',
            'allysa.banlaoi@cozyblissful.com',
        ];
        foreach ($oldEmails as $email) {
            $old = User::where('email', $email)->first();
            if ($old) {
                TherapistAvailability::where('therapist_id', $old->id)->delete();
                $old->delete();
            }
        }

        $therapists = [
            ['name' => 'Jacky Adlawan',  'email' => 'jacky@example.com',  'specialty' => 'Swedish Massage & Aromatherapy'],
            ['name' => 'Quenay Samson',  'email' => 'quenay@example.com',  'specialty' => 'Swedish & Hilot Massage'],
            ['name' => 'Lily Hermosa',   'email' => 'lily@example.com',    'specialty' => 'Deep Tissue & Prenatal'],
        ];

        foreach ($therapists as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name'      => $data['name'],
                    'password'  => Hash::make(self::DEFAULT_PASSWORD),
                    'specialty' => $data['specialty'],
                    'status'    => 'active',
                ]
            );
            $user->syncRoles([$therapistRole]);
            $this->seedAvailability($user->id);
        }

        $staffRole = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
        $nailTechs = [
            ['name' => 'Jade Ferrer',    'email' => 'jade@example.com',    'specialty' => 'Gel Nails & Nail Art'],
            ['name' => 'Allysa Banlaoi', 'email' => 'allysa@example.com', 'specialty' => 'Manicure & Pedicure Spa'],
        ];

        foreach ($nailTechs as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name'      => $data['name'],
                    'password'  => Hash::make(self::DEFAULT_PASSWORD),
                    'specialty' => $data['specialty'],
                    'status'    => 'active',
                ]
            );
            $user->syncRoles([$staffRole]);
        }

        $this->command->info('Staff seeded: 3 Therapists + 2 Nail Techs created with @example.com and password "password".');
    }

    private function seedAvailability(int $therapistId): void
    {
        $today = Carbon::today();
        for ($i = 0; $i < 7; $i++) {
            TherapistAvailability::firstOrCreate([
                'therapist_id' => $therapistId,
                'date'         => $today->copy()->addDays($i)->format('Y-m-d'),
            ]);
        }
    }
}