<?php

use App\Http\Controllers\LineController;
use App\Http\Controllers\StationController;
use App\Http\Controllers\TrainController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get("/stations", [StationController::Class, "index"]);
Route::post("/stations", [StationController::Class, "store"]);
Route::put("/stations/{id}", [StationController::Class, "update"]);
Route::delete("/stations/{id}", [StationController::Class, "destroy"]);

Route::get("/lines", [LineController::Class, "index"]);
Route::post("/lines", [LineController::Class, "store"]);
Route::put("/lines/{id}", [LineController::Class, "update"]);
Route::delete("/lines/{id}", [LineController::Class, "destroy"]);

Route::get("/trains", [TrainController::Class, "index"]);
Route::post("/trains", [TrainController::Class, "store"]);
Route::put("/trains/{id}", [TrainController::Class, "update"]);
Route::delete("/trains/{id}", [TrainController::Class, "destroy"]);