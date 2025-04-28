<?php

use App\Http\Controllers\LineController;
use App\Http\Controllers\StationController;
use App\Http\Controllers\TrainController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::get("/trains-get", [TrainController::class, "index"]);
Route::post("/trains-post", [TrainController::class, "store"]);
Route::put("/trains-put/{id}", [TrainController::class, "update"]);
Route::delete("/trains-delete/{id}", [TrainController::class, "destroy"]);
