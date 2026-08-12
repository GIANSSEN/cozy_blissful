<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AuditLog;

class AuditLogSeeder extends Seeder
{
    public function run(): void
    {
        // Truncate existing logs to re-seed with rich dataset
        AuditLog::truncate();

        $logs = [
            [
                'actor'      => 'System Admin',
                'actor_role' => 'admin',
                'action'     => 'update',
                'entity'     => 'RBAC Permissions',
                'detail'     => "Updated permissions for role 'staff' — added manage-appointments, removed view-reports",
                'module'     => 'Access Control',
                'ip_address' => '192.168.1.10',
                'session_id' => 'sess_a1b2c3d4',
                'severity'   => 'warning',
                'metadata'   => [
                    'role'             => 'staff',
                    'permissions_added'   => ['manage-appointments'],
                    'permissions_removed' => ['view-reports'],
                    'updated_by'       => 'admin@cozyblissful.com',
                ],
                'created_at' => now()->subHours(2),
            ],
            [
                'actor'      => 'Maria Santos',
                'actor_role' => 'staff',
                'action'     => 'login',
                'entity'     => 'Authentication',
                'detail'     => 'Signed in successfully from 122.55.14.20 — Chrome 124 on Windows 11',
                'module'     => 'Auth',
                'ip_address' => '122.55.14.20',
                'session_id' => 'sess_d4e5f6g7',
                'severity'   => 'info',
                'metadata'   => [
                    'browser'    => 'Chrome 124.0.0',
                    'os'         => 'Windows 11',
                    'login_type' => 'Standard Email',
                ],
                'created_at' => now()->subHours(4),
            ],
            [
                'actor'      => 'System Admin',
                'actor_role' => 'admin',
                'action'     => 'create',
                'entity'     => 'Service Catalog',
                'detail'     => "Added new service 'Couple Hot Stone Massage' — ₱2,400 / 120 min",
                'module'     => 'Services',
                'ip_address' => '192.168.1.10',
                'session_id' => 'sess_g7h8i9j0',
                'severity'   => 'info',
                'metadata'   => [
                    'service_name' => 'Couple Hot Stone Massage',
                    'price'        => 2400.00,
                    'duration'     => 120,
                    'category'     => 'Specialty',
                ],
                'created_at' => now()->subHours(8),
            ],
            [
                'actor'      => 'John Therapist',
                'actor_role' => 'therapist',
                'action'     => 'update',
                'entity'     => 'Therapist Schedule',
                'detail'     => 'Marked available for work on 2026-08-15 and 2026-08-16',
                'module'     => 'Schedule',
                'ip_address' => '203.87.45.31',
                'session_id' => 'sess_j1k2l3m4',
                'severity'   => 'info',
                'metadata'   => [
                    'therapist_id' => 3,
                    'added_dates'  => ['2026-08-15', '2026-08-16'],
                ],
                'created_at' => now()->subHours(12),
            ],
            [
                'actor'      => 'System Admin',
                'actor_role' => 'admin',
                'action'     => 'config',
                'entity'     => 'System Settings',
                'detail'     => 'Changed booking lead-time buffer from 1 hour to 2 hours',
                'module'     => 'Settings',
                'ip_address' => '192.168.1.10',
                'session_id' => 'sess_m4n5o6p7',
                'severity'   => 'warning',
                'metadata'   => [
                    'setting_key' => 'booking_lead_time_hours',
                    'old_value'   => 1,
                    'new_value'   => 2,
                ],
                'created_at' => now()->subDay(),
            ],
            [
                'actor'      => 'Anna Reyes',
                'actor_role' => 'staff',
                'action'     => 'login',
                'entity'     => 'Authentication',
                'detail'     => 'Signed in successfully from 178.20.9.4 — Safari 17 on macOS Sonoma',
                'module'     => 'Auth',
                'ip_address' => '178.20.9.4',
                'session_id' => 'sess_p7q8r9s0',
                'severity'   => 'info',
                'metadata'   => [
                    'browser' => 'Safari 17.4',
                    'os'      => 'macOS 14.4',
                ],
                'created_at' => now()->subDays(1)->subHours(3),
            ],
            [
                'actor'      => 'System Admin',
                'actor_role' => 'admin',
                'action'     => 'create',
                'entity'     => 'Marketing Promo',
                'detail'     => "Issued promo code 'BLISS2026' — 15% discount on Swedish & Aromatherapy",
                'module'     => 'Marketing',
                'ip_address' => '192.168.1.10',
                'session_id' => 'sess_s1t2u3v4',
                'severity'   => 'info',
                'metadata'   => [
                    'code'       => 'BLISS2026',
                    'discount'   => '15%',
                    'valid_until'=> '2026-12-31',
                ],
                'created_at' => now()->subDays(2),
            ],
            [
                'actor'      => 'System Admin',
                'actor_role' => 'admin',
                'action'     => 'delete',
                'entity'     => 'Product Inventory',
                'detail'     => "Removed product 'Sample Lavender Oil 10ml' — stock: 0, reason: discontinued by supplier",
                'module'     => 'Inventory',
                'ip_address' => '192.168.1.10',
                'session_id' => 'sess_v4w5x6y7',
                'severity'   => 'danger',
                'metadata'   => [
                    'product_id' => 84,
                    'sku'        => 'OIL-LAV-10',
                    'reason'     => 'Discontinued supplier stock',
                ],
                'created_at' => now()->subDays(2)->subHours(5),
            ],
            [
                'actor'      => 'Jane Client',
                'actor_role' => 'client',
                'action'     => 'create',
                'entity'     => 'Appointment',
                'detail'     => 'Booked Swedish Signature Massage for August 15, 2026 at 02:00 PM',
                'module'     => 'Bookings',
                'ip_address' => '54.201.8.77',
                'session_id' => 'sess_y7z8a9b0',
                'severity'   => 'info',
                'metadata'   => [
                    'appointment_id' => 101,
                    'service'        => 'Swedish Signature Massage',
                    'price'          => 1200.00,
                    'client_notes'   => 'Prefers light pressure on shoulders',
                ],
                'created_at' => now()->subDays(3),
            ],
            [
                'actor'      => 'System Admin',
                'actor_role' => 'admin',
                'action'     => 'access',
                'entity'     => 'Audit Logs Export',
                'detail'     => 'Generated and downloaded CSV audit trail report for period August 1–12, 2026',
                'module'     => 'Security',
                'ip_address' => '192.168.1.10',
                'session_id' => 'sess_b1c2d3e4',
                'severity'   => 'info',
                'metadata'   => [
                    'records_exported' => 142,
                    'format'           => 'CSV',
                ],
                'created_at' => now()->subDays(3)->subHours(4),
            ],
            [
                'actor'      => 'Maria Santos',
                'actor_role' => 'staff',
                'action'     => 'update',
                'entity'     => 'Appointment #101',
                'detail'     => "Assigned therapist 'John Therapist' to booking #101 and confirmed schedule",
                'module'     => 'Bookings',
                'ip_address' => '122.55.14.20',
                'session_id' => 'sess_e4f5g6h7',
                'severity'   => 'warning',
                'metadata'   => [
                    'appointment_id' => 101,
                    'therapist'      => 'John Therapist',
                    'previous_status'=> 'Pending',
                    'new_status'     => 'Confirmed',
                ],
                'created_at' => now()->subDays(4),
            ],
            [
                'actor'      => 'System Admin',
                'actor_role' => 'admin',
                'action'     => 'delete',
                'entity'     => 'Staff Account',
                'detail'     => "Deactivated and removed staff account 'temp.staff@cozyblissful.com'",
                'module'     => 'User Management',
                'ip_address' => '192.168.1.10',
                'session_id' => 'sess_h7i8j9k0',
                'severity'   => 'danger',
                'metadata'   => [
                    'user_id' => 15,
                    'email'   => 'temp.staff@cozyblissful.com',
                    'reason'  => 'Contract expired',
                ],
                'created_at' => now()->subDays(5),
            ],
        ];

        foreach ($logs as $log) {
            AuditLog::create($log);
        }
    }
}
