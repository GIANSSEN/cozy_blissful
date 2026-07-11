<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class RateLimitRegister
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $key = $this->resolveRequestSignature($request);

        $maxAttempts = 3; // Maximum registration attempts
        $decayMinutes = 60; // Minutes to wait after max attempts

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'message' => 'Too many registration attempts. Please try again in ' . ceil($seconds / 60) . ' minutes.',
                'retry_after' => $seconds,
            ], 429);
        }

        RateLimiter::hit($key, $decayMinutes * 60);

        $response = $next($request);

        // Clear rate limiter on successful registration
        if ($response->getStatusCode() === 201) {
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
        // Rate limit by IP address
        return 'register:' . $request->ip();
    }
}
