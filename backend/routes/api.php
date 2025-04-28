<?php

use App\Http\Controllers\LineController;
use App\Http\Controllers\StationController;
use App\Http\Controllers\TrainController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::get("/stations", [StationController::class, "index"]);
Route::post("/stations", [StationController::class, "store"]);
Route::put("/stations/{id}", [StationController::class, "update"]);
Route::delete("/stations/{id}", [StationController::class, "destroy"]);

Route::get("/lines", [LineController::class, "index"]);
Route::post("/lines", [LineController::class, "store"]);
Route::put("/lines/{id}", [LineController::class, "update"]);
Route::delete("/lines/{id}", [LineController::class, "destroy"]);

Route::get("/trains", [TrainController::class, "index"]);
Route::post("/trains", [TrainController::class, "store"]);
Route::put("/trains/{id}", [TrainController::class, "update"]);
Route::delete("/trains/{id}", [TrainController::class, "destroy"]);
