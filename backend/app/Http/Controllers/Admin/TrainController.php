<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Train;
use Illuminate\Http\Request;

class TrainController extends Controller
{
    public function index()
    {
        $trains = Train::all();
        return view('admin.trains.index', compact('trains'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'type' => 'required|in:ground,underground,suspended',
        ]);

        Train::create([
            'name' => $request->name,
            'capacity' => $request->capacity,
            'type' => $request->type,
        ]);

        return redirect()->route('admin.trains.index')->with('success', 'Train created successfully.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'type' => 'required|in:ground,underground,suspended',
        ]);

        $train = Train::findOrFail($id);

        $train->update([
            'name' => $request->name,
            'capacity' => $request->capacity,
            'type' => $request->type,
        ]);

        return redirect()->route('admin.trains.index')->with('success', 'Train updated successfully.');
    }

    public function destroy($id)
    {
        $train = Train::findOrFail($id);
        $train->delete();

        return redirect()->route('admin.trains.index')->with('success', 'Train deleted successfully.');
    }
}