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
            $request -> validate([
                "name" => "required|string",
                "capacity" => "required|float",
                "type" => "required|string"
            ]);
        } catch (ValidationException $th) {
            return response()->json(["success" => false, "message" => "failed" -> $th -> errors()], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
        }

        Train::create([
            "name" => $request -> name,
            "capacity" => $request -> capacity,
            "type" => $request -> type
        ]);
        return response()->json(["success" => true, "message" => "success"], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }

    public function destroy($id){
        $trains = Train::findOrFail($id);
        $trains -> delete();
    }

    public function update(Request $request, $id) {
        try {
            $request -> validate([
                "name" => "required|string",
                "capacity" => "required|float",
                "type" => "required|string"
            ]);
        } catch (ValidationException $th) {
            return response()->json(["success" => false, "message" => "failed" -> $th -> errors()], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
        }
        $trains = Train::findOrFail($id);
        $trains -> update([
            "name" => $request -> name,
            "capacity" => $request -> capacity,
            "type" => $request -> type
        ]);
        return response()->json(["success" => true, "message" => "success"], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }
}
