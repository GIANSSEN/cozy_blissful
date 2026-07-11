<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class RateLimitLogin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $key = $this->resolveRequestSignature($request);

        $maxAttempts = 5; // Maximum login attempts
        $decayMinutes = 15; // Minutes to wait after max attempts

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'message' => 'Too many login attempts. Please try again in ' . ceil($seconds / 60) . ' minutes.',
                'retry_after' => $seconds,
            ], 429);
        }

        RateLimiter::hit($key, $decayMinutes * 60);

        $response = $next($request);

        // Clear rate limiter on successful login
        if ($response->getStatusCode() === 200) {
            RateLimiter::clear($key);
        }

        return $response;
    }

    /**
     * Resolve request signature for rate limiting.
     *
     * @param  Request  $request
     * @return string
     */
    protected function resolveRequestSignature(Request $request): string
    {
        // Rate limit by email + IP for better security
        return 'login:' . $request->ip() . ':' . $request->input('email');
    }
}
