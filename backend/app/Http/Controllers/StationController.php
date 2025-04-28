<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Station;
use Illuminate\Validation\ValidationException;

class StationController extends Controller
{
    public function index() {
        $stations = Station::with('lines')->get();
        return response()->json($stations, 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string',
                'x' => 'required|numeric',
                'y' => 'required|numeric',
                'location' => 'required|array',
            ]);
        } catch (ValidationException $th) {
            return response()->json(["success" => false, "message" => $th->errors()], 422, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
        }

        Station::create([
            "name" => $validated['name'],
            "x" => $validated['x'],
            "y" => $validated['y'],
            "location" => json_encode($validated['location']), // <<< encode it
        ]);

        return response()->json(["success" => true, "message" => "Station created"], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string',
                'x' => 'required|numeric',
                'y' => 'required|numeric',
                'location' => 'required|array',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                "success" => false,
                "message" => "failed",
                "errors" => $e->errors()
            ], 422, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
        }

        $station = Station::findOrFail($id);
        $station->update([
            "name" => $validated['name'],
            "x" => $validated['x'],
            "y" => $validated['y'],
            "location" => json_encode($validated['location']), // <<< encode it here too
        ]);

        return response()->json(["success" => true, "message" => "Station updated"], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }

    public function destroy($id)
    {
        $station = Station::findOrFail($id);
        $station->delete();

        return response()->json(["success" => true, "message" => "Station deleted"], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }
}
