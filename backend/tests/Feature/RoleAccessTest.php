<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles for testing
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        Role::create(['name' => 'therapist', 'guard_name' => 'web']);
        Role::create(['name' => 'client', 'guard_name' => 'web']);
    }

    /**
     * Test dynamic registration with role assignment.
     */
    public function test_user_can_register_with_role()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Registered Client',
            'email' => 'clientreg@example.com',
            'password' => 'SecretPass123!',
            'password_confirmation' => 'SecretPass123!',
            'role' => 'client',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'access_token',
                'role',
                'user' => ['id', 'name', 'email']
            ])
            ->assertJson([
                'role' => 'client',
                'user' => [
                    'email' => 'clientreg@example.com'
                ]
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'clientreg@example.com'
        ]);

        $user = User::where('email', 'clientreg@example.com')->first();
        $this->assertTrue($user->hasRole('client'));
    }

    /**
     * Test login endpoint returns bearer token and user role.
     */
    public function test_user_can_login_and_receive_token_and_role()
    {
        $user = User::factory()->create([
            'email' => 'testlogin@example.com',
            'password' => bcrypt('password123')
        ]);
        $user->assignRole('therapist');

        $response = $this->postJson('/api/login', [
            'email' => 'testlogin@example.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'access_token',
                'role',
                'user' => ['id', 'name', 'email']
            ])
            ->assertJson([
                'role' => 'therapist'
            ]);
    }

    /**
     * Test access control for role-protected route groups.
     */
    public function test_role_based_access_control_middleware()
    {
        // 1. Create users
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $client = User::factory()->create();
        $client->assignRole('client');

        // 2. Client attempts to access Admin dashboard (Expect 403)
        $responseClientOnAdmin = $this->actingAs($client, 'sanctum')
            ->getJson('/api/admin/dashboard');
        $responseClientOnAdmin->assertStatus(403);

        // 3. Admin attempts to access Admin dashboard (Expect 200)
        $responseAdminOnAdmin = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/dashboard');
        $responseAdminOnAdmin->assertStatus(200)
            ->assertJsonStructure([
                'stats',
                'recent_appointments'
            ]);

        // 4. Client attempts to access Client bookings (Expect 200)
        $responseClientOnClient = $this->actingAs($client, 'sanctum')
            ->getJson('/api/booking/dashboard');
        $responseClientOnClient->assertStatus(200)
            ->assertJsonStructure([
                'bookings',
                'available_services'
            ]);
    }
}
