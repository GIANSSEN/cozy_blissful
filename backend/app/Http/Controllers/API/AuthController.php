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
use App\Mail\ResetPasswordMail;

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

            \App\Models\AuditLog::log('login', 'Authentication', "Failed login attempt for email '{$email}'", [
                'actor' => $email,
                'actor_role' => 'guest',
                'module' => 'Auth',
                'ip' => $request->ip(),
                'severity' => 'warning',
                'metadata' => [
                    'email' => $email,
                    'user_agent' => $request->userAgent(),
                    'status' => 'failed'
                ]
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

        // Log successful login in system log and AuditLog database
        Log::info('Successful login', [
            'user_id' => $user->id,
            'email' => $email,
            'ip' => $request->ip(),
        ]);

        \App\Models\AuditLog::log('login', 'Authentication', "User '{$user->name}' logged into system successfully", [
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
     * Send a password reset link to the given email.
     */
    /**
     * Send a password reset link to the given email.
     */
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower(trim($request->email));
        $user  = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'No account found with this email address. Please register or check your email.'
            ], 404);
        }

        // Check if Gmail SMTP credentials are set in .env
        $mailUsername = config('mail.mailers.smtp.username');
        $mailPassword = config('mail.mailers.smtp.password');
        if (empty($mailUsername) || str_contains($mailUsername, 'YOUR_GMAIL') || empty($mailPassword) || str_contains($mailPassword, 'YOUR_16_DIGIT')) {
            return response()->json([
                'message' => 'Please enter your 16-character Google App Password in backend/.env under MAIL_PASSWORD to enable email sending.'
            ], 422);
        }

        try {
            // Generate secure random token
            $rawToken = \Illuminate\Support\Str::random(60);

            // Store token in database
            \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $email],
                [
                    'email'      => $email,
                    'token'      => \Illuminate\Support\Facades\Hash::make($rawToken),
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

            return response()->json([
                'message' => 'SMTP Error: Unable to send email. ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset the user's password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'    => 'required|string',
            'email'    => 'required|email',
            'password' => [
                'required',
                'string',
                'confirmed',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/',
            ],
        ], [
            'password.regex'     => 'The password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
            'password.confirmed' => 'Password confirmation does not match.',
        ]);

        $email = strtolower(trim($request->email));
        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $email)->first();

        if (!$record) {
            return response()->json(['message' => 'Invalid or expired password reset link.'], 422);
        }

        // Check if token is older than 60 minutes
        if (\Carbon\Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $email)->delete();
            return response()->json(['message' => 'Password reset link has expired. Please request a new one.'], 422);
        }

        // Verify token hash
        if (!\Illuminate\Support\Facades\Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Invalid password reset token.'], 422);
        }

        // Find user & update password
        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        $user->save();

        // Delete used token & revoke active tokens for security
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $email)->delete();
        $user->tokens()->delete();

        Log::info('Password successfully reset', ['user_id' => $user->id, 'email' => $email]);

        return response()->json([
            'message' => 'Your password has been reset successfully! You can now log in with your new password.'
        ]);
    }
}

