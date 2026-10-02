<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Public legal pages — must be crawlable without auth for Meta App Review.
Route::view('/privacy-policy', 'privacy');
Route::redirect('/privacy', '/privacy-policy', 301);
