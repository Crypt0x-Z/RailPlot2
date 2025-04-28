<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <title>{{ __('User Management') }} - {{ config('app.name', 'Laravel') }}</title>
    <style>
        html, body {
            min-height: 100%;
        }
        body {
            background: linear-gradient(to bottom right, #6a11cb 0%, #2575fc 100%);
            background-repeat: no-repeat;
            background-attachment: fixed;
            display: flex;
            justify-content: center;
            align-items: center;
            padding-top: 2rem;
            padding-bottom: 2rem;
            padding-left: 1rem;
            padding-right: 1rem;
        }

        .admin-management-card {
            max-width: 900px;
            width: 100%;
            border-radius: 0.75rem; 
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
            background-color: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            border: none;
            color: #212529;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
        }
      
        .admin-management-card .card-body {
            overflow-y: auto;
        }
        
        .admin-management-card .table > thead {
            background-color: rgba(233, 236, 239, 0.8);
            color: #212529;
            position: sticky;
            top: 0;
            z-index: 1;
        }
         .admin-management-card .table th {
            border-bottom-width: 1px;
            border-color: rgba(0, 0, 0, 0.1);
         }

         .admin-management-card tbody tr td {
            color: #212529;
            border-color: rgba(0, 0, 0, 0.08);
         }

         .admin-management-card .table-striped > tbody > tr:nth-of-type(odd) > * {
            background-color: rgba(0, 0, 0, 0.03);
            color: #212529;
         }

         .admin-management-card .text-muted {
             color: #6c757d !important;
         }

         .admin-management-card .card-title {
            color: #343a40;
         }
         .admin-management-card .card-subtitle {
            color: #495057;
         }
         .footer-actions-container {
            border-top: 1px solid rgba(0, 0, 0, 0.1);
            padding-top: 1rem;
            margin-top: 1rem; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
         }
    </style>
</head>
<body>
    <div class="card admin-management-card">
        <div class="card-body p-4 p-md-5">
            <h1 class="card-title h2 fw-bold text-center mb-3">{{ __('User Management Panel') }}</h1>
            <h2 class="card-subtitle h4 fw-semibold mb-4 text-center text-muted">{{ __('Manage Users') }}</h2>
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
                                            <form action="{{ route('admin.users.destroy', $user->id) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this user?');" class="d-inline">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-danger btn-sm" title="{{ __('Delete User') }}">
                                                    <i class="bi bi-trash-fill"></i> {{-- Bootstrap Icon --}}
                                                </button>
                                            </form>
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
            </div>
            <div class="footer-actions-container">
                 <div>
                    <a href="{{ route('admin.trains.index') }}" class="btn btn-outline-info btn-sm">
                        <i class="bi bi-people-fill me-1"></i>
                        {{ __('Switch to Train Management') }}
                    </a>
                 </div>
                 <div>
                    <form method="POST" action="{{ route('logout') }}" class="d-inline">
                        @csrf
                        <button type="submit" class="btn btn-outline-danger btn-sm">
                             <i class="bi bi-box-arrow-right me-1"></i>
                            {{ __('Log Out') }}
                        </button>
                    </form>
                 </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>
</html>