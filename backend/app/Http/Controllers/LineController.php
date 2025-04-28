<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Line;
use Illuminate\Validation\ValidationException;

class LineController extends Controller
{
    public function index() {
        $lines = Line::with('stations')->get();
        return response()->json($lines, 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }

    public function store(Request $request) {
        try {
            $request->validate([
                "name" => "required|string",
                "code" => "required|string",
                "color" => "required|string",
                "type" => "required|string",
                "stations" => "required|array"
            ]);
        } catch (ValidationException $th) {
            return response()->json([
                "success" => false,
                "message" => "failed",
                "errors" => $th->errors()
            ], 422);
        }
    
        $line = Line::create([
            "name" => $request->name,
            "code" => $request->code,
            "color" => $request->color,
            "type" => $request->type
        ]);
    
        // Attach the stations
        $line->stations()->attach($request->stations);
    
        return response()->json(["success" => true, "message" => "success"], 201);
    }
    

    public function update(Request $request, $id) {
        try {
            $validated = $request->validate([
                "name" => "required|string",
                "code" => "required|string|max:2",
                "color" => "required|string",
                "type" => "required|string",
                "stations" => "required|array|min:2",
                "stations.*" => "integer"
            ]);
        } catch (ValidationException $th) {
            return response()->json([
                "success" => false,
            "message" => $th->errors()
        ], 422, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
        }

        $line = Line::findOrFail($id);
        $line->update([
            "name" => $validated['name'],
            "code" => $validated['code'],
            "color" => $validated['color'],
            "type" => $validated['type'],
        ]);

        $line->stations()->sync($validated['stations']);

        return response()->json(["success" => true, "message" => "Line updated"], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }

    public function destroy($id) {
        $line = Line::findOrFail($id);
        $line->stations()->detach(); // remove relationships
        $line->delete();

        return response()->json(["success" => true, "message" => "Line deleted"], 200, ["Access-Control-Allow-Origin" => "*"], JSON_UNESCAPED_UNICODE);
    }
}
