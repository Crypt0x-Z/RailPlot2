<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Line;
use Illuminate\Validation\ValidationException;

class LineController extends Controller
{
    public function index() {
        $lines = Line::all();
        return response()->json($lines, 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }

    public function store(Request $request) {
        try {
            $request -> validate([
                "start_station_id" => "required|integer",
                "end_station_id" => "required|integer",
                "length" => "required|integer",
                "demand" => "required|string",
                "type" => "required|string"
            ]);
        } catch (ValidationException $th) {
            return response()->json(["success" => false, "message" => "failed" -> $th -> errors()], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
        }

        Line::create([
            "start_station_id" => $request -> start_station_id,
            "end_station_id" => $request -> end_station_id,
            "length" => $request -> length,
            "demand" => $request -> demand,
            "type" => $request -> type
        ]);
        return response()->json(["success" => true, "message" => "success"], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }

    public function destroy($id){
        $line = Line::findOrFail($id);
        $line -> delete();
    }

    public function update(Request $request, $id) {
        try {
            $request -> validate([
                "start_station_id" => "required|integer",
                "end_station_id" => "required|integer",
                "length" => "required|integer",
                "demand" => "required|string",
                "type" => "required|string"
            ]);
        } catch (ValidationException $th) {
            return response()->json(["success" => false, "message" => "failed" -> $th -> errors()], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
        }
        $line = Line::findOrFail($id);
        $line -> update([
            "start_station_id" => $request -> start_station_id,
            "end_station_id" => $request -> end_station_id,
            "length" => $request -> length,
            "demand" => $request -> demand,
            "type" => $request -> type
        ]);
        return response()->json(["success" => true, "message" => "success"], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }
}
