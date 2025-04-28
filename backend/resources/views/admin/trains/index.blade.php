@extends('layouts.admin')

@section('content')
<div class="max-w-6xl mx-auto py-8">

    <h1 class="text-3xl font-bold mb-8 text-center">Train Management Panel</h1>

    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 class="text-2xl font-semibold mb-4">Add a New Train</h2>
        <form action="{{ route('admin.trains.store') }}" method="POST" class="space-y-4">
            @csrf
            <div class="flex flex-col md:flex-row md:space-x-4">
                <input type="text" name="name" placeholder="Train Name" required class="border p-2 rounded w-full">
                <input type="number" name="capacity" placeholder="Train Quantity" required class="border p-2 rounded w-full">
                <select name="type" required class="border p-2 rounded w-full">
                    <option value="">Select Type</option>
                    <option value="ground">Ground</option>
                    <option value="underground">Underground</option>
                    <option value="suspended">Suspended</option>
                </select>
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full md:w-auto mt-2 md:mt-0">
                    Add Train
                </button>
            </div>
        </form>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">Manage Trains</h2>
        <table class="min-w-full table-auto">
            <thead>
                <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                    <th class="py-3 px-6 text-left">Name</th>
                    <th class="py-3 px-6 text-left">Quantity</th>
                    <th class="py-3 px-6 text-left">Type</th>
                    <th class="py-3 px-6 text-left">Actions</th>
                </tr>
            </thead>
            <tbody class="text-gray-600">
                @foreach ($trains as $train)
                <tr class="border-b border-gray-200 hover:bg-gray-100">
                    <form action="{{ route('admin.trains.update', $train->id) }}" method="POST" class="flex items-center">
                        @csrf
                        @method('PUT')
                        <td class="py-3 px-6">
                            <input type="text" name="name" value="{{ $train->name }}" required class="border p-2 rounded w-full">
                        </td>
                        <td class="py-3 px-6">
                            <input type="number" name="capacity" value="{{ $train->capacity }}" required class="border p-2 rounded w-full">
                        </td>
                        <td class="py-3 px-6">
                            <select name="type" required class="border p-2 rounded w-full">
                                <option value="ground" {{ $train->type == 'ground' ? 'selected' : '' }}>Ground</option>
                                <option value="underground" {{ $train->type == 'underground' ? 'selected' : '' }}>Underground</option>
                                <option value="suspended" {{ $train->type == 'suspended' ? 'selected' : '' }}>Suspended</option>
                            </select>
                        </td>
                        <td class="py-3 px-6 flex space-x-2">
                            <button type="submit" class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
                                Update
                            </button>
                    </form>
                    <form action="{{ route('admin.trains.destroy', $train->id) }}" method="POST" onsubmit="return confirm('Are you sure?')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">
                            Delete
                        </button>
                    </form>
                        </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

</div>
@endsection
