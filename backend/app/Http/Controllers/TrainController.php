<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Train;
use Illuminate\Validation\ValidationException;

class TrainController extends Controller
{
    public function index() {
        $trains = Train::all();
        return response()->json($trains, 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }

    public function store(Request $request) {
        try {
            $validated = $request->validate([
                "name" => "required|string",
                "capacity" => "required|numeric",
                "type" => "required|string"
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                "success" => false,
                "message" => "failed",
                "errors" => $e->errors()
            ], 422, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
        }

        Train::create($validated);

        return response()->json(["success" => true, "message" => "Train created"], 201, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }

    public function update(Request $request, $id) {
        try {
            $validated = $request->validate([
                "name" => "required|string",
                "capacity" => "required|numeric",
                "type" => "required|string"
            ]);
        } catch (ValidationException $th) {
            return response()->json([
                "success" => false,
                "message" => "failed",
                "errors" => $th->errors()
            ], 422, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
        }

        $train = Train::findOrFail($id);
        $train->update($validated);

        return response()->json(["success" => true, "message" => "Train updated"], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }

    public function destroy($id) {
        $train = Train::findOrFail($id);
        $train->delete();

        return response()->json(["success" => true, "message" => "Train deleted"], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }
}
