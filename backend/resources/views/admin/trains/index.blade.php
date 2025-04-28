<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <title>{{ __('Train Management') }} - {{ config('app.name', 'Laravel') }}</title>
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

        .train-management-card {
            max-width: 1100px;
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

        .train-management-card .card-body {
            overflow-y: auto;
        }

        .train-management-card .table > thead {
            background-color: rgba(233, 236, 239, 0.8);
            color: #212529;
            position: sticky;
            top: 0;
            z-index: 1;
        }
         .train-management-card .table th {
            border-bottom-width: 1px;
            border-color: rgba(0, 0, 0, 0.1);
            white-space: nowrap; 
         }

         .train-management-card tbody tr td {
            color: #212529;
            border-color: rgba(0, 0, 0, 0.08);
            vertical-align: middle;
         }

         .train-management-card .table-striped > tbody > tr:nth-of-type(odd) > * {
            background-color: rgba(0, 0, 0, 0.03);
            color: #212529;
         }

         .train-management-card .card-title {
            color: #343a40;
         }
         .train-management-card .card-subtitle {
            color: #495057;
         }

         .management-section {
            border: 1px solid rgba(0,0,0,.1);
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin-bottom: 2rem;
            background-color: rgba(255,255,255,0.5);
         }
         .management-section h2 {
             margin-top: 0;
             margin-bottom: 1.5rem;
             color: #343a40;
         }

         .form-control-sm { height: calc(1.5em + .5rem + 2px); padding: .25rem .5rem; font-size: .875rem; } /* Ensure consistent small size */
         .form-select-sm { height: calc(1.5em + .5rem + 2px); padding: .25rem 1.5rem .25rem .5rem; font-size: .875rem; background-position: right .5rem center;}
         td .form-control-sm, td .form-select-sm {
             min-width: 120px;
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
    <div class="card train-management-card">
        <div class="card-body p-4 p-md-5">
            <h1 class="card-title h2 fw-bold text-center mb-4">{{ __('Train Management Panel') }}</h1>
            <div class="management-section">
                <h2 class="h4 fw-semibold">{{ __('Add a New Train') }}</h2>
                <form action="{{ route('admin.trains.store') }}" method="POST">
                    @csrf
                    <div class="row g-3 align-items-end">
                        <div class="col-md">
                            <label for="add_train_name" class="form-label visually-hidden">{{ __('Train Name') }}</label>
                            <input type="text" name="name" id="add_train_name" placeholder="{{ __('Train Name') }}" required class="form-control">
                        </div>
                        <div class="col-md">
                             <label for="add_train_capacity" class="form-label visually-hidden">{{ __('Train Quantity') }}</label>
                            <input type="number" name="capacity" id="add_train_capacity" placeholder="{{ __('Train Quantity') }}" required class="form-control">
                        </div>
                        <div class="col-md">
                             <label for="add_train_type" class="form-label visually-hidden">{{ __('Select Type') }}</label>
                            <select name="type" id="add_train_type" required class="form-select">
                                <option value="" selected disabled>{{ __('Select Type') }}</option>
                                <option value="ground">{{ __('Ground') }}</option>
                                <option value="underground">{{ __('Underground') }}</option>
                                <option value="suspended">{{ __('Suspended') }}</option>
                            </select>
                        </div>
                        <div class="col-md-auto">
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="bi bi-plus-lg me-1"></i>{{ __('Add Train') }}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <div class="management-section">
                <h2 class="h4 fw-semibold">{{ __('Manage Trains') }}</h2>
                <div class="table-responsive">
                    <table class="table table-hover table-striped align-middle table-bordered mb-0">
                        <thead>
                            <tr>
                                <th scope="col" class="py-2 px-3">{{ __('Name') }}</th>
                                <th scope="col" class="py-2 px-3">{{ __('Quantity') }}</th>
                                <th scope="col" class="py-2 px-3">{{ __('Type') }}</th>
                                <th scope="col" class="py-2 px-3 text-center">{{ __('Actions') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($trains as $train)
                                <tr>
                                    <td class="py-2 px-3">
                                        <input type="text" name="name" value="{{ $train->name }}" required class="form-control form-control-sm" form="update-form-{{ $train->id }}">
                                    </td>
                                    <td class="py-2 px-3">
                                        <input type="number" name="capacity" value="{{ $train->capacity }}" required class="form-control form-control-sm" form="update-form-{{ $train->id }}">
                                    </td>
                                    <td class="py-2 px-3">
                                        <select name="type" required class="form-select form-select-sm" form="update-form-{{ $train->id }}">
                                            <option value="ground" {{ $train->type == 'ground' ? 'selected' : '' }}>{{ __('Ground') }}</option>
                                            <option value="underground" {{ $train->type == 'underground' ? 'selected' : '' }}>{{ __('Underground') }}</option>
                                            <option value="suspended" {{ $train->type == 'suspended' ? 'selected' : '' }}>{{ __('Suspended') }}</option>
                                        </select>
                                    </td>
                                    <td class="py-2 px-3">
                                        <div class="d-flex justify-content-center gap-2">
                                            <form action="{{ route('admin.trains.update', $train->id) }}" method="POST" id="update-form-{{ $train->id }}" class="d-inline">
                                                @csrf
                                                @method('PUT')
                                                <button type="submit" class="btn btn-success btn-sm" title="{{ __('Update Train') }}">
                                                    <i class="bi bi-check-lg"></i>
                                                </button>
                                            </form>
                                            <form action="{{ route('admin.trains.destroy', $train->id) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this train?');" class="d-inline">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-danger btn-sm" title="{{ __('Delete Train') }}">
                                                    <i class="bi bi-trash-fill"></i> 
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center py-4 text-muted">{{ __('No trains found.') }}</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="footer-actions-container">
                 <div>
                    <a href="{{ route('admin.users.index') }}" class="btn btn-outline-info btn-sm">
                        <i class="bi bi-people-fill me-1"></i>
                        {{ __('Switch to User Management') }}
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