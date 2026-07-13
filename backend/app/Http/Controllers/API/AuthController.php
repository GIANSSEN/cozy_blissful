<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeMail;

class AuthController extends Controller
{
    /**
     * Authenticate user and issue Sanctum token.
     */
    public function login(Request $request)
    {
        // Enhanced validation
        $validated = $request->validate([
            'email' => [
                'required',
                'string',
                'email:rfc',
                'max:255',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'max:255',
            ],
        ]);

        // Sanitize email input
        $email = strtolower(trim($validated['email']));

        // Attempt authentication
        if (!Auth::attempt(['email' => $email, 'password' => $validated['password']])) {
            // Log failed login attempt
            Log::warning('Failed login attempt', [
                'email' => $email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Generic error message to prevent user enumeration
            return response()->json([
                'message' => 'Invalid login credentials.'
            ], 401);
        }

        $user = User::where('email', $email)->firstOrFail();

        // Revoke all previous tokens for security
        $user->tokens()->delete();

        // Create new token with expiration
        $token = $user->createToken('auth_token', ['*'], now()->addDays(7))->plainTextToken;
        $role = $user->getRoleNames()->first() ?? 'client';

        // Log successful login
        Log::info('Successful login', [
            'user_id' => $user->id,
            'email' => $email,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'role' => $role,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }

    /**
     * Register a new user and assign them a role.
     */
    public function register(Request $request)
    {
        // Enhanced validation with stricter rules
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'min:2',
                'max:255',
                'regex:/^[a-zA-Z\s\'-]+$/', // Only letters, spaces, hyphens, apostrophes
            ],
            'email' => [
                'required',
                'string',
                'email:rfc',
                'max:255',
                'unique:users',
                'regex:/^[a-zA-Z0-9.!#$%&\'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/',
            ],
            'password' => [
                'required',
                'string',
                'confirmed',
                'min:8',
                'max:255',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/', // At least one lowercase, uppercase, digit, special char
            ],
        ], [
            'name.regex' => 'The name can only contain letters, spaces, hyphens, and apostrophes.',
            'email.regex' => 'Please provide a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'password.regex' => 'The password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
            'password.min' => 'The password must be at least 8 characters.',
            'password.confirmed' => 'The password confirmation does not match.',
        ]);

        // Sanitize and normalize inputs
        $sanitizedName = trim(strip_tags($validated['name']));
        $sanitizedEmail = strtolower(trim($validated['email']));

        // Additional security: check for common weak passwords
        $weakPasswords = ['password', '12345678', 'qwerty123', 'abc12345'];
        if (in_array(strtolower($validated['password']), $weakPasswords)) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => [
                    'password' => ['This password is too common. Please choose a stronger password.']
                ]
            ], 422);
        }

        try {
            $user = User::create([
                'name' => $sanitizedName,
                'email' => $sanitizedEmail,
                'password' => Hash::make($validated['password']),
            ]);

            // Hardcode client role for public registration to prevent privilege escalation
            $user->assignRole('client');

            // Create token with expiration
            $token = $user->createToken('auth_token', ['*'], now()->addDays(7))->plainTextToken;

            // Log successful registration
            Log::info('New user registered', [
                'user_id' => $user->id,
                'email' => $sanitizedEmail,
                'ip' => $request->ip(),
            ]);

            if ($user->email) {
                try {
                    Mail::to($user->email)->queue(new WelcomeMail($user->name));
                } catch (\Exception $e) {
                    Log::error('Failed to queue welcome email: ' . $e->getMessage());
                }
            }

            return response()->json([
                'message' => 'Registration successful',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'role' => 'client',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]
            ], 201);
        } catch (\Exception $e) {
            // Log error without exposing sensitive details
            Log::error('Registration failed', [
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Registration failed. Please try again later.'
            ], 500);
        }
    }

    /**
     * Revoke the user's token.
     */
    public function logout(Request $request)
    {
        // Revoke current access token
        $request->user()->currentAccessToken()->delete();

        // Log logout
        Log::info('User logged out', [
            'user_id' => $request->user()->id,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Logged out successfully.'
        ]);
    }
}
