<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\TrainController;
use Illuminate\Support\Facades\Route;

// Redirect homepage to login
Route::get('/', function () {
    return redirect('/login');
});


// Normal user dashboard
Route::middleware(['auth', 'verified'])->get('/dashboard', function () {
    return view('dashboard');
})->name('dashboard');

// Admin routes
Route::middleware(['auth', \App\Http\Middleware\AdminMiddleware::class])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/trains', [TrainController::class, 'index'])->name('trains.index');
        Route::post('/trains', [TrainController::class, 'store'])->name('trains.store');
        Route::put('/trains/{id}', [TrainController::class, 'update'])->name('trains.update');
        Route::delete('/trains/{id}', [TrainController::class, 'destroy'])->name('trains.destroy');

        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});

// Profile routes (for normal users)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->get('/main-app', function () {
    // This tells Laravel to load 'main.php' from the 'resources/views/' directory
    // You don't need the '.php' extension here.
    return view('main');
})->name('main-app');
// Auth routes
require __DIR__.'/auth.php';
