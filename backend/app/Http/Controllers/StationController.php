<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Station;
use Illuminate\Validation\ValidationException;

class StationController extends Controller
{
    public function index() {
        $stations = Station::all();
        return response()->json($stations, 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }

    public function store(Request $request) {
        try {
            $request -> validate([
                "station_name" => "required|string",
                "x_coord" => "required|float",
                "y_coord" => "required|float",
                "type" => "required|string"
            ]);
        } catch (ValidationException $th) {
            return response()->json(["success" => false, "message" => "failed" -> $th -> errors()], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
        }

        Station::create([
            "station_name" => $request -> station_name,
            "x_coord" => $request -> x_coord,
            "y_coord" => $request -> y_coord,
            "type" => $request -> type
        ]);
        return response()->json(["success" => true, "message" => "success"], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }

    public function destroy($id){
        $stations = Station::findOrFail($id);
        $stations -> delete();
    }

    public function update(Request $request, $id) {
        try {
            $request -> validate([
                "station_name" => "required|string",
                "x_coord" => "required|float",
                "y_coord" => "required|float",
                "type" => "required|string"
            ]);
        } catch (ValidationException $th) {
            return response()->json(["success" => false, "message" => "failed" -> $th -> errors()], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
        }
        $stations = Station::findOrFail($id);
        $stations -> update([
            "station_name" => $request -> station_name,
            "x_coord" => $request -> x_coord,
            "y_coord" => $request -> y_coord,
            "type" => $request -> type
        ]);
        return response()->json(["success" => true, "message" => "success"], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }
}
