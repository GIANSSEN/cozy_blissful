<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeMail;
use App\Models\User;
use Google\Client as GoogleClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    /**
     * Authenticate with a Google ID token (JWT) issued by Google Identity Services.
     *
     * The token is verified server-side with the official google/apiclient
     * library, which validates the signature against Google's public keys,
     * the audience (our client ID), the issuer, and the expiry.
     */
    public function google(Request $request)
    {
        $validated = $request->validate([
            'credential' => ['required', 'string'],
        ]);

        $clientId = config('services.google.client_id');
        if (!$clientId) {
            Log::error('Google login attempted but GOOGLE_CLIENT_ID is not configured.');
            return response()->json(['message' => 'Google sign-in is not available.'], 503);
        }

        try {
            $client = new GoogleClient(['client_id' => $clientId]);
            $payload = $client->verifyIdToken($validated['credential']);
        } catch (\Exception $e) {
            Log::warning('Google token verification error', ['ip' => $request->ip()]);
            $payload = false;
        }

        if (!$payload || empty($payload['email']) || empty($payload['email_verified'])) {
            Log::warning('Invalid Google ID token', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Invalid Google credential.'], 401);
        }

        return $this->issueSession(
            $request,
            'google',
            strtolower(trim($payload['email'])),
            $payload['name'] ?? trim(($payload['given_name'] ?? '') . ' ' . ($payload['family_name'] ?? ''))
        );
    }

    /**
     * Authenticate with a Facebook access token issued by the Meta JS SDK.
     *
     * The token is verified server-side against the Graph API debug_token
     * endpoint using our app access token (app_id|app_secret), confirming it
     * is valid and was issued for this app, before the profile is fetched.
     */
    public function facebook(Request $request)
    {
        $validated = $request->validate([
            'access_token' => ['required', 'string'],
        ]);

        $appId = config('services.facebook.app_id');
        $appSecret = config('services.facebook.app_secret');
        if (!$appId || !$appSecret) {
            Log::error('Facebook login attempted but FACEBOOK_APP_ID/FACEBOOK_APP_SECRET are not configured.');
            return response()->json(['message' => 'Facebook sign-in is not available.'], 503);
        }

        $graph = rtrim(config('services.facebook.graph_url'), '/');

        // Step 1: verify the token belongs to our app and is valid.
        $debug = Http::get("{$graph}/debug_token", [
            'input_token' => $validated['access_token'],
            'access_token' => "{$appId}|{$appSecret}",
        ]);
        $data = $debug->json('data');

        if (!$debug->successful() || empty($data['is_valid']) || ($data['app_id'] ?? null) !== $appId) {
            Log::warning('Invalid Facebook access token', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Invalid Facebook credential.'], 401);
        }

        // Step 2: fetch the verified profile with the user's own token.
        $profile = Http::get("{$graph}/me", [
            'fields' => 'id,name,email',
            'access_token' => $validated['access_token'],
        ]);

        $email = $profile->json('email');
        if (!$profile->successful() || !$email) {
            // Facebook accounts registered via phone number have no email.
            return response()->json([
                'message' => 'Your Facebook account has no email address we can use. Please sign up with email instead.'
            ], 422);
        }

        return $this->issueSession(
            $request,
            'facebook',
            strtolower(trim($email)),
            $profile->json('name') ?? 'Facebook User'
        );
    }

    /**
     * Find the customer by verified email or register a new customer profile,
     * then issue our application's Sanctum session token.
     */
    private function issueSession(Request $request, string $provider, string $email, string $name)
    {
        $user = User::where('email', $email)->first();
        $isNew = false;

        if (!$user) {
            $isNew = true;
            $user = User::create([
                'name' => trim($name) !== '' ? trim(strip_tags($name)) : 'New Customer',
                'email' => $email,
                // Social accounts get an unguessable random password; they can
                // set a real one later via password reset.
                'password' => Hash::make(Str::random(64)),
            ]);
            $user->assignRole('client');

            Log::info('New user registered via social login', [
                'user_id' => $user->id,
                'provider' => $provider,
                'ip' => $request->ip(),
            ]);

            try {
                Mail::to($user->email)->queue(new WelcomeMail($user->name));
            } catch (\Exception $e) {
                Log::error('Failed to queue welcome email: ' . $e->getMessage());
            }
        }

        // Revoke all previous tokens for security
        $user->tokens()->delete();

        $token = $user->createToken('auth_token', ['*'], now()->addDays(7))->plainTextToken;
        $role = $user->getRoleNames()->first() ?? 'client';

        Log::info('Successful social login', [
            'user_id' => $user->id,
            'provider' => $provider,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => $isNew ? 'Registration successful' : 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'role' => $role,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]
        ], $isNew ? 201 : 200);
    }
}
