<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ClientController;
use App\Http\Controllers\API\TherapistController;
use App\Http\Controllers\API\StaffController;
use App\Http\Controllers\API\SocialAuthController;

// Public auth routes with custom rate limiting for enhanced security
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle.register');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle.login');
Route::post('/auth/google', [SocialAuthController::class, 'google'])->middleware('throttle.login');
Route::post('/auth/facebook', [SocialAuthController::class, 'facebook'])->middleware('throttle.login');

// Protected routes group
Route::middleware('auth:sanctum')->group(function () {
    // Logout route
    Route::post('/logout', [AuthController::class, 'logout']);

    // Retrieve authenticated user info
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'role' => $user->getRoleNames()->first() ?? 'client'
        ]);
    });

    // Group 1: /admin/* -> Admin only
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'index']);
        Route::get('/appointments', [AdminController::class, 'getAppointments']);
        Route::post('/appointments/{id}/assign', [AdminController::class, 'assignTherapist']);
        Route::post('/appointments/{id}/status', [AdminController::class, 'updateStatus']);
        Route::get('/therapists', [AdminController::class, 'getTherapists']);
        Route::get('/customers', [AdminController::class, 'getCustomers']);

        // Services CRUD
        Route::get('/services', [AdminController::class, 'getServices']);
        Route::post('/services', [AdminController::class, 'storeService']);
        Route::put('/services/{id}', [AdminController::class, 'updateService']);
        Route::delete('/services/{id}', [AdminController::class, 'deleteService']);
    });

    // Group 2: /therapist/* -> Therapist only
    Route::middleware('role:therapist')->prefix('therapist')->group(function () {
        Route::get('/dashboard', [TherapistController::class, 'index']);
        Route::get('/availability', [TherapistController::class, 'getAvailability']);
        Route::post('/availability/toggle', [TherapistController::class, 'toggleAvailability']);
    });

    // Group 3: /staff/* -> Staff only
    Route::middleware('role:staff')->prefix('staff')->group(function () {
        Route::get('/dashboard',              [StaffController::class, 'index']);
        Route::get('/therapists',             [StaffController::class, 'getTherapists']);
        Route::post('/availability/toggle',   [StaffController::class, 'toggleAvailability']);
        Route::get('/appointments',           [StaffController::class, 'getAppointments']);
    });

    // Group 4: /booking/* -> Client only for booking management
    Route::middleware('role:client')->prefix('booking')->group(function () {
        Route::get('/dashboard', [ClientController::class, 'index']);
        Route::post('/store', [ClientController::class, 'store']);
    });
});
