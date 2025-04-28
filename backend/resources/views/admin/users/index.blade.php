{{-- You can keep or remove this @extends based on how you use this file --}}
{{-- @extends('layouts.admin') --}}

{{-- Remove @section if not using @extends --}}
{{-- @section('content') --}}

{{-- Full HTML structure for standalone styling --}}
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- Include Bootstrap CSS via CDN --}}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    {{-- Include Bootstrap Icons CSS (for logout icon) --}}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <title>{{ __('User Management') }} - {{ config('app.name', 'Laravel') }}</title>

    <style>
        /* Apply gradient background directly to body */
        html, body {
            min-height: 100%; /* Ensure html also takes full height */
        }
        body {
            background: linear-gradient(to bottom right, #6a11cb 0%, #2575fc 100%);
            background-repeat: no-repeat;
            background-attachment: fixed; /* Keep gradient fixed */
            display: flex; /* Use flexbox to center card */
            justify-content: center;
            align-items: center;
            padding-top: 2rem; /* Add padding */
            padding-bottom: 2rem;
            padding-left: 1rem;
            padding-right: 1rem;
        }
        /* Style the card like login/register */
        .admin-management-card {
            max-width: 900px; /* Adjust max-width as needed */
            width: 100%;
            /* margin-left/right: auto; /* Centering handled by body flexbox */
            border-radius: 0.75rem; /* Rounded corners */
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); /* Shadow */
            background-color: rgba(255, 255, 255, 0.95); /* Slightly transparent white */
            backdrop-filter: blur(5px); /* Optional: Blur effect */
            -webkit-backdrop-filter: blur(5px); /* Safari support */
            border: none;
            color: #212529; /* Ensure text inside card is dark */
            /* Add max-height and overflow for very long tables on small screens */
            max-height: 90vh;
            display: flex; /* Use flex for card body */
            flex-direction: column;
        }
         /* Make card body scrollable if content exceeds max-height */
        .admin-management-card .card-body {
            overflow-y: auto;
        }
        /* Style table header within the styled card */
        .admin-management-card .table > thead {
            background-color: rgba(233, 236, 239, 0.8);
            color: #212529;
            position: sticky; /* Make header sticky */
            top: 0; /* Stick to the top of the scrollable card-body */
            z-index: 1; /* Ensure header stays above scrolling content */
        }
         .admin-management-card .table th {
            border-bottom-width: 1px;
            border-color: rgba(0, 0, 0, 0.1);
         }
        /* Ensure table row text is readable */
         .admin-management-card tbody tr td {
            color: #212529;
            border-color: rgba(0, 0, 0, 0.08);
         }
         /* Ensure striped rows look good */
         .admin-management-card .table-striped > tbody > tr:nth-of-type(odd) > * {
            background-color: rgba(0, 0, 0, 0.03);
            color: #212529;
         }
         /* Style links/buttons */
         .admin-management-card .btn-danger {
             /* Default styling is fine */
         }
         .admin-management-card .text-muted {
             color: #6c757d !important;
         }
         /* Headings inside the card */
         .admin-management-card .card-title {
            color: #343a40;
         }
         .admin-management-card .card-subtitle {
            color: #495057;
         }
         /* Logout button styling */
         .logout-form-container {
            border-top: 1px solid rgba(0, 0, 0, 0.1); /* Separator line */
            padding-top: 1rem;
            margin-top: 1.5rem;
         }
    </style>
</head>
<body>

    {{-- The main styled card containing all content --}}
    <div class="card admin-management-card">
        <div class="card-body p-4 p-md-5">

            {{-- Headings INSIDE the card --}}
            <h1 class="card-title h2 fw-bold text-center mb-3">{{ __('User Management Panel') }}</h1>
            <h2 class="card-subtitle h4 fw-semibold mb-4 text-center text-muted">{{ __('Manage Users') }}</h2>

            {{-- Responsive table wrapper --}}
            <div class="table-responsive">
                <table class="table table-hover table-striped align-middle table-bordered mb-0">
                    <thead>
                        <tr>
                            <th scope="col" class="py-2 px-3">{{ __('Name') }}</th>
                            <th scope="col" class="py-2 px-3">{{ __('Email') }}</th>
                            <th scope="col" class="py-2 px-3 text-center">{{ __('Role') }}</th>
                            <th scope="col" class="py-2 px-3 text-center">{{ __('Actions') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($users as $user)
                            <tr>
                                <td class="py-2 px-3">{{ $user->name }}</td>
                                <td class="py-2 px-3">{{ $user->email }}</td>
                                <td class="py-2 px-3 text-center">{{ ucfirst($user->role) }}</td>
                                <td class="py-2 px-3">
                                    <div class="d-flex justify-content-center gap-2">
                                        @if ($user->role !== 'admin' && auth()->user()->id !== $user->id)
                                            {{-- Delete User Form --}}
                                            <form action="{{ route('admin.users.destroy', $user->id) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this user?');" class="d-inline">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-danger btn-sm" title="{{ __('Delete User') }}">
                                                    <i class="bi bi-trash-fill"></i> {{-- Bootstrap Icon --}}
                                                </button>
                                            </form>
                                            {{-- Edit User Link (Example) --}}
                                            {{-- <a href="{{ route('admin.users.edit', $user->id) }}" class="btn btn-primary btn-sm" title="{{ __('Edit User') }}"><i class="bi bi-pencil-fill"></i></a> --}}
                                        @else
                                            <span class="text-muted fst-italic">{{ __('Admin') }}</span>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="text-center py-4 text-muted">{{ __('No users found.') }}</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>{{-- End table-responsive --}}

            {{-- Optional: Pagination links --}}
            {{-- @if ($users->hasPages()) --}}
            {{-- <div class="mt-4 d-flex justify-content-center"> --}}
                {{-- {{ $users->links() }} --}}
            {{-- </div> --}}
            {{-- @endif --}}

            {{-- Logout Button Section --}}
            <div class="logout-form-container text-end"> {{-- Aligns button to the right --}}
                <form method="POST" action="{{ route('logout') }}" class="d-inline">
                    @csrf
                    <button type="submit" class="btn btn-outline-danger btn-sm">
                         <i class="bi bi-box-arrow-right me-1"></i> {{-- Bootstrap Icon --}}
                        {{ __('Log Out') }}
                    </button>
                </form>
            </div>

        </div>{{-- End card-body --}}
    </div>{{-- End card --}}

    {{-- Include Bootstrap JS Bundle --}}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

</body>
</html>

{{-- Remove @endsection if not using @extends --}}
{{-- @endsection --}}
