<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
    |--------------------------------------------------------------------------
    | SECURITY: Restrict allowed origins before deploying to production.
    | Set CORS_ALLOWED_ORIGINS in your .env to a comma-separated list:
    |   CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
    |
    | For local development this defaults to localhost origins.
    |--------------------------------------------------------------------------
    */
    'allowed_origins' => array_filter(
        explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5174,http://localhost:5173,http://127.0.0.1:5174'))
    ),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,


];
