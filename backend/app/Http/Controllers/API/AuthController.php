<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;
use App\Mail\WelcomeMail;
use App\Mail\ResetPasswordMail;

class AuthController extends Controller
{
    /**
     * Authenticate user and issue Sanctum token.
     */
    public function login(Request $request)
    {
        // Enhanced validation with field-specific messages
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
        ], [
            'email.required' => 'Email address is required.',
            'email.email' => 'Invalid email format. Example: maria@email.com.',
            'email.max' => 'Email address is too long.',
            'password.required' => 'Password is required.',
            'password.min' => 'Incorrect password. Password must be at least 8 characters.',
            'password.max' => 'Password is too long.',
        ]);

        // Sanitize email input
        $email = strtolower(trim($validated['email']));

        // Specific lookup so we can return field-specific messages
        // (email not found vs. wrong password).
        $existingUser = User::where('email', $email)->first();

        if (!$existingUser) {
            Log::warning('Failed login attempt — email not found', [
                'email' => $email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'message' => 'No account found with this email address. Please check your email or create a new account.',
                'errors' => [
                    'email' => ['No account found with this email address.'],
                ],
                'field' => 'email',
            ], 401);
        }

        if (!Hash::check($validated['password'], $existingUser->password)) {
            // Log failed login attempt
            Log::warning('Failed login attempt — incorrect password', [
                'email' => $email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            AuditLog::log('login', 'Authentication', "Failed login attempt for email '{$email}' (incorrect password)", [
                'actor' => $email,
                'actor_role' => 'guest',
                'module' => 'Auth',
                'ip' => $request->ip(),
                'severity' => 'warning',
                'metadata' => [
                    'email' => $email,
                    'user_agent' => $request->userAgent(),
                    'status' => 'failed',
                    'reason' => 'incorrect_password'
                ]
            ]);

            return response()->json([
                'message' => 'Incorrect password. Please try again or click Forgot password to reset it.',
                'errors' => [
                    'password' => ['Incorrect password. Please try again.'],
                ],
                'field' => 'password',
            ], 401);
        }

        // Credentials are valid — establish the session.
        Auth::login($existingUser);

        $user = User::where('email', $email)->firstOrFail();

        // Revoke all previous tokens for security
        $user->tokens()->delete();

        // Create new token with expiration
        $token = $user->createToken('auth_token', ['*'], now()->addDays(7))->plainTextToken;
        $role = $user->getRoleNames()->first() ?? 'client';

        // Log successful login in system log and AuditLog database
        Log::info('Successful login', [
            'user_id' => $user->id,
            'email' => $email,
            'ip' => $request->ip(),
        ]);

        AuditLog::log('login', 'Authentication', "User '{$user->name}' logged into system successfully", [
            'actor' => $user->name,
            'actor_role' => $role,
            'module' => 'Auth',
            'ip' => $request->ip(),
            'severity' => 'info',
            'metadata' => [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $role,
                'user_agent' => $request->userAgent()
            ]
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
                'regex:/^[\pL\s\'.-]+$/u', // Letters, spaces, hyphens, apostrophes, periods (e.g., Jr., Ma.)
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
     * Send a password reset link to the given email.
     */
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower(trim($request->email));
        $user = User::where('email', $email)->first();

        // SECURITY: always return the same generic response whether or not the
        // account exists, so attackers cannot enumerate registered emails.
        $genericResponse = response()->json([
            'message' => 'If an account exists for that email address, a password reset link has been sent. Please check your inbox.'
        ]);

        if (!$user) {
            Log::info('Password reset requested for unknown email', ['email' => $email, 'ip' => $request->ip()]);
            return $genericResponse;
        }

        // Check if Gmail SMTP credentials are set in .env (never disclose
        // configuration details to the client)
        $mailUsername = config('mail.mailers.smtp.username');
        $mailPassword = config('mail.mailers.smtp.password');
        if (empty($mailUsername) || str_contains($mailUsername, 'YOUR_GMAIL') || empty($mailPassword) || str_contains($mailPassword, 'YOUR_16_DIGIT')) {
            Log::error('Password reset email not configured', ['hint' => 'Set MAIL_USERNAME / MAIL_PASSWORD in backend/.env']);
            return $genericResponse;
        }

        try {
            // Generate secure random token
            $rawToken = Str::random(60);

            // Store token in database
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $email],
                [
                    'email' => $email,
                    'token' => Hash::make($rawToken),
                    'created_at' => now(),
                ]
            );

            // Send password reset email via SMTP
            Mail::to($user->email)->send(new ResetPasswordMail($user, $rawToken));

            Log::info('Password reset email sent successfully', ['email' => $email]);

            return response()->json([
                'message' => 'Password reset link sent to your email address!'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send password reset email: ' . $e->getMessage());

            // SECURITY: never expose internal exception details to clients
            return response()->json([
                'message' => 'Unable to send the reset email right now. Please try again later.'
            ], 500);
        }
    }

    /**
     * Reset the user's password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => [
                'required',
                'string',
                'confirmed',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/',
            ],
        ], [
            'password.regex' => 'The password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
            'password.confirmed' => 'Password confirmation does not match.',
        ]);

        $email = strtolower(trim($request->email));
        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (!$record) {
            return response()->json(['message' => 'Invalid or expired password reset link.'], 422);
        }

        // Check if token is older than 60 minutes
        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            return response()->json(['message' => 'Password reset link has expired. Please request a new one.'], 422);
        }

        // Verify token hash
        if (!Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Invalid reset token.'], 422);
        }

        // Find user & update password
        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Delete used token & revoke active tokens for security
        DB::table('password_reset_tokens')->where('email', $email)->delete();
        $user->tokens()->delete();

        Log::info('Password successfully reset', ['user_id' => $user->id, 'email' => $email]);

        return response()->json([
            'message' => 'Your password has been reset successfully! You can now log in with your new password.'
        ]);
    }

    /**
     * Log out the authenticated user (revoke current access token).
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->currentAccessToken()?->delete();
            AuditLog::log('logout', 'Authentication', "User '{$user->name}' logged out", [
                'actor' => $user->name,
                'actor_role' => $user->getRoleNames()->first() ?? 'user',
                'module' => 'Auth',
                'ip' => $request->ip(),
                'severity' => 'info',
            ]);
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}


