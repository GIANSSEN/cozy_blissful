<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ClientController;
use App\Http\Controllers\API\TherapistController;

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

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
    });

    // Group 2: /therapist/* -> Therapist only
    Route::middleware('role:therapist')->prefix('therapist')->group(function () {
        Route::get('/dashboard', [TherapistController::class, 'index']);
    });

    // Group 3: /booking/* -> Client only for booking management
    Route::middleware('role:client')->prefix('booking')->group(function () {
        Route::get('/dashboard', [ClientController::class, 'index']);
        Route::post('/store', [ClientController::class, 'store']);
    });
});
