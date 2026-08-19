<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // ── Core security headers ──────────────────────────────────────────────
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // ── HSTS — force HTTPS for 1 year, all subdomains ────────────────────
        // Remove this header in local HTTP dev if needed, keep for staging/prod.
        if ($request->secure() || app()->environment('production', 'staging')) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
        }

        // ── Content Security Policy ───────────────────────────────────────────
        // Allows resources from self, Google fonts/accounts, and inline styles/scripts
        // required by React and framer-motion. Tighten further in production.
        $csp = implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https:",
            "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com",
            "frame-src https://accounts.google.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests",
        ]);
        $response->headers->set('Content-Security-Policy', $csp);

        // ── Cache control — prevent sensitive responses being cached ──────────
        if ($this->isAuthRoute($request)) {
            $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            $response->headers->set('Pragma', 'no-cache');
        }

        // ── Remove server fingerprinting headers ──────────────────────────────
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }

    /**
     * Determine whether the current request is an auth route.
     */
    protected function isAuthRoute(Request $request): bool
    {
        $authPaths = ['/api/login', '/api/register', '/api/forgot-password', '/api/reset-password', '/api/auth/'];
        foreach ($authPaths as $path) {
            if (str_starts_with($request->getPathInfo(), $path)) {
                return true;
            }
        }
        return false;
    }
}
