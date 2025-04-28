@extends('layouts.admin')

@section('content')
    <h1 class="text-3xl font-bold text-center mb-8">User Management Panel</h1>

    <h2 class="text-2xl font-semibold mb-4">Manage Users</h2>

    <table class="min-w-full bg-white border border-gray-300">
        <thead class="bg-gray-100">
            <tr>
                <th class="py-2 px-4 border-b">Name</th>
                <th class="py-2 px-4 border-b">Email</th>
                <th class="py-2 px-4 border-b">Role</th>
                <th class="py-2 px-4 border-b">Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($users as $user)
                <tr class="text-center">
                    <td class="py-2 px-4 border-b">{{ $user->name }}</td>
                    <td class="py-2 px-4 border-b">{{ $user->email }}</td>
                    <td class="py-2 px-4 border-b capitalize">{{ $user->role }}</td>
                    <td class="py-2 px-4 border-b flex justify-center gap-2">
                        @if ($user->role !== 'admin')
                            <form action="{{ route('admin.users.destroy', $user->id) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this user?');">
                                @csrf
                                @method('DELETE')
                                <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">
                                    Delete
                                </button>
                            </form>
                        @else
                            <span class="text-gray-500 italic">Admin</span>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
