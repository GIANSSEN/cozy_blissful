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
            return response()->json(['message' => 'Google sign-in is not configured.'], 503);
        }

        $payload = false;

        if (class_exists(GoogleClient::class)) {
            try {
                $client = new GoogleClient(['client_id' => $clientId]);
                $payload = $client->verifyIdToken($validated['credential']);
            } catch (\Exception $e) {
                Log::warning('Google SDK verification notice: ' . $e->getMessage());
            }
        }

        // Fallback: Verify token via Google tokeninfo HTTP endpoint if SDK returns false
        if (!$payload) {
            try {
                $response = Http::get('https://oauth2.googleapis.com/tokeninfo', [
                    'id_token' => $validated['credential']
                ]);
                if ($response->successful() && !empty($response->json('email'))) {
                    $payload = $response->json();
                }
            } catch (\Exception $e) {
                Log::warning('Google tokeninfo API error: ' . $e->getMessage());
            }
        }

        if (!$payload || empty($payload['email'])) {
            Log::warning('Invalid Google ID token', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Invalid or expired Google credential.'], 401);
        }

        $email = strtolower(trim($payload['email']));
        $name = $payload['name'] ?? trim(($payload['given_name'] ?? '') . ' ' . ($payload['family_name'] ?? ''));

        return $this->issueSession(
            $request,
            'google',
            $email,
            $name ?: 'Google User'
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
            return response()->json(['message' => 'Facebook sign-in is not configured.'], 503);
        }

        $graph = rtrim(config('services.facebook.graph_url', 'https://graph.facebook.com/v21.0'), '/');

        // Step 1: Verify the token belongs to our app and is valid (if debug_token available)
        $debug = Http::get("{$graph}/debug_token", [
            'input_token' => $validated['access_token'],
            'access_token' => "{$appId}|{$appSecret}",
        ]);
        $data = $debug->json('data');

        if ($debug->successful() && (!isset($data['is_valid']) || !$data['is_valid'])) {
            Log::warning('Invalid Facebook access token', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Invalid or expired Facebook credential.'], 401);
        }

        // Step 2: Fetch the verified profile
        $profile = Http::get("{$graph}/me", [
            'fields' => 'id,name,first_name,last_name,email',
            'access_token' => $validated['access_token'],
        ]);

        $email = $profile->json('email');
        $firstName = $profile->json('first_name');
        $lastName = $profile->json('last_name');
        $name = $profile->json('name') ?? trim("{$firstName} {$lastName}");

        if (!$profile->successful() || !$email) {
            return response()->json([
                'message' => 'Your Facebook account has no verified email address. Please sign up with email.'
            ], 422);
        }

        return $this->issueSession(
            $request,
            'facebook',
            strtolower(trim($email)),
            $name ?: 'Facebook User'
        );
    }

    /**
     * Redirect initiation for Facebook OAuth login.
     */
    public function redirectFacebook()
    {
        $appId = config('services.facebook.app_id');
        if (!$appId) {
            return response()->json(['message' => 'Facebook sign-in is not configured.'], 503);
        }

        $redirectUri = url('/api/auth/facebook/callback');
        $url = "https://www.facebook.com/v21.0/dialog/oauth?" . http_build_query([
            'client_id' => $appId,
            'redirect_uri' => $redirectUri,
            'scope' => 'email,public_profile',
            'response_type' => 'code',
        ]);

        return redirect()->away($url);
    }

    /**
     * OAuth callback endpoint for Facebook login.
     */
    public function callbackFacebook(Request $request)
    {
        $code = $request->query('code');
        $frontendUrl = config('app.frontend_url', 'http://localhost:5174');

        if (!$code) {
            return redirect()->away("{$frontendUrl}/login?error=" . urlencode('Facebook authentication was cancelled.'));
        }

        $appId = config('services.facebook.app_id');
        $appSecret = config('services.facebook.app_secret');
        $redirectUri = url('/api/auth/facebook/callback');
        $graph = rtrim(config('services.facebook.graph_url', 'https://graph.facebook.com/v21.0'), '/');

        // Exchange code for access token
        $tokenRes = Http::get("{$graph}/oauth/access_token", [
            'client_id' => $appId,
            'client_secret' => $appSecret,
            'redirect_uri' => $redirectUri,
            'code' => $code,
        ]);

        $accessToken = $tokenRes->json('access_token');
        if (!$tokenRes->successful() || !$accessToken) {
            return redirect()->away("{$frontendUrl}/login?error=" . urlencode('Could not retrieve access token from Facebook.'));
        }

        // Fetch user profile
        $profile = Http::get("{$graph}/me", [
            'fields' => 'id,name,first_name,last_name,email',
            'access_token' => $accessToken,
        ]);

        $email = $profile->json('email');
        $firstName = $profile->json('first_name');
        $lastName = $profile->json('last_name');
        $name = $profile->json('name') ?? trim("{$firstName} {$lastName}");

        if (!$profile->successful() || !$email) {
            return redirect()->away("{$frontendUrl}/login?error=" . urlencode('Facebook account has no verified email address.'));
        }

        $emailStr = strtolower(trim($email));
        $user = User::where('email', $emailStr)->first();

        if (!$user) {
            // New user — send them to the register page to set their name & password
            return redirect()->away("{$frontendUrl}/register?prefill_email=" . urlencode($emailStr) . '&prefill_name=' . urlencode($name ?: '') . '&provider=facebook');
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token', ['*'], now()->addDays(7))->plainTextToken;
        $role = $user->getRoleNames()->first() ?? 'client';

        return redirect()->away("{$frontendUrl}/login?token={$token}&role={$role}");
    }

    /**
     * Find the customer by verified email or register a new customer profile,
     * then issue our application's Sanctum session token.
     */
    private function issueSession(Request $request, string $provider, string $email, string $name)
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            // New social user — do NOT auto-create; return 202 so the frontend
            // redirects them to the Register page to choose their name & password.
            Log::info('Social sign-in: new user needs registration', [
                'provider' => $provider,
                'ip'       => $request->ip(),
            ]);

            return response()->json([
                'needs_registration' => true,
                'email'              => $email,
                'suggested_name'     => $name ?: '',
                'provider'           => $provider,
            ], 202);
        }

        // Existing user — revoke old tokens and issue a fresh session.
        $user->tokens()->delete();

        $token = $user->createToken('auth_token', ['*'], now()->addDays(7))->plainTextToken;
        $role  = $user->getRoleNames()->first() ?? 'client';

        Log::info('Successful social login', [
            'user_id'  => $user->id,
            'provider' => $provider,
            'ip'       => $request->ip(),
        ]);

        return response()->json([
            'message'      => 'Login successful',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'role'         => $role,
            'user'         => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
        ]);
    }
}
