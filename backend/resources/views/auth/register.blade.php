<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="icon" href="https://placehold.co/32x32/0d6efd/ffffff?text=R" type="image/png">
    <title>{{ __('Register') }} - {{ config('app.name', 'Laravel') }}</title>
    <style>
        body {
            background: linear-gradient(to bottom right, #6a11cb 0%, #2575fc 100%);
            background-repeat: no-repeat;
            background-attachment: fixed;
        }
        .register-container {
            min-height: 100vh;
            padding-top: 2rem;
            padding-bottom: 2rem;
        }
        .register-card {
            max-width: 500px; 
            width: 100%;
            border-radius: 0.75rem; 
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); 
            background-color: rgba(255, 255, 255, 0.95); 
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            border: none;
        }

        .form-control-lg {
             background-color: rgba(255, 255, 255, 0.8);
        }
        .form-control-lg:focus {
             background-color: rgba(255, 255, 255, 0.9);
        }

        .invalid-feedback {
            display: block; 
            width: 100%;
            margin-top: .25rem;
            font-size: .875em;
            color: #dc3545;
        }

        .already-registered-link {
             font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container d-flex justify-content-center align-items-center register-container p-3 p-md-4">
        <div class="card register-card">
            <div class="card-body p-4 p-sm-5">
                <h2 class="card-title text-center fw-bold mb-4">{{ __('Create Account') }}</h2>
                <form method="POST" action="{{ route('register') }}">
                    @csrf
                    <div class="mb-3">
                        <label for="name" class="form-label">{{ __('Name') }}</label>
                        <input
                            type="text"
                            class="form-control form-control-lg @error('name') is-invalid @enderror"
                            id="name"
                            name="name"
                            value="{{ old('name') }}"
                            required
                            autofocus
                            autocomplete="name"
                            placeholder="{{ __('e.g., John Doe') }}"
                        >
                        @error('name')
                            <div class="invalid-feedback">
                                {{ $message }}
                            </div>
                        @enderror
                    </div>
                    <div class="mb-3">
                        <label for="email" class="form-label">{{ __('Email') }}</label>
                        <input
                            type="email"
                            class="form-control form-control-lg @error('email') is-invalid @enderror"
                            id="email"
                            name="email"
                            value="{{ old('email') }}"
                            required
                            autocomplete="username"
                            placeholder="{{ __('e.g., yourname@example.com') }}"
                        >
                        @error('email')
                            <div class="invalid-feedback">
                                {{ $message }}
                            </div>
                        @enderror
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">{{ __('Password') }}</label>
                        <input
                            type="password"
                            class="form-control form-control-lg @error('password') is-invalid @enderror"
                            id="password"
                            name="password"
                            required
                            autocomplete="new-password"
                            placeholder="{{ __('Choose a strong password') }}"
                        >
                         @error('password')
                            <div class="invalid-feedback">
                                {{ $message }}
                            </div>
                        @enderror
                    </div>
                    <div class="mb-4">
                        <label for="password_confirmation" class="form-label">{{ __('Confirm Password') }}</label>
                        <input
                            type="password"
                            class="form-control form-control-lg @error('password_confirmation') is-invalid @enderror"
                            id="password_confirmation"
                            name="password_confirmation"
                            required
                            autocomplete="new-password"
                            placeholder="{{ __('Repeat your password') }}"
                        >
                         @error('password_confirmation')
                            <div class="invalid-feedback">
                                {{ $message }}
                            </div>
                        @enderror
                    </div>
                    <div class="d-flex flex-column flex-sm-row justify-content-sm-between align-items-sm-center gap-3">
                         <a class="text-decoration-none already-registered-link order-sm-1 text-center text-sm-start" href="{{ route('login') }}">
                            {{ __('Already registered?') }}
                        </a>
                        <div class="d-grid order-sm-2">
                            <button type="submit" class="btn btn-primary btn-lg fw-semibold">
                                {{ __('Register') }}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>
</html>