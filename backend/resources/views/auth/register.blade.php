{{-- Use your main layout or a guest layout if you have one --}}
{{-- Example: <x-guest-layout> or @extends('layouts.app') --}}

{{-- If not using a layout, you'll need the full HTML structure --}}
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}"> {{-- Added locale --}}
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    {{-- CSRF Token for JS requests (Optional but good practice) --}}
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- Include Bootstrap CSS via CDN --}}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    {{-- Favicon (optional) --}}
    <link rel="icon" href="https://placehold.co/32x32/0d6efd/ffffff?text=R" type="image/png">
    <title>{{ __('Register') }} - {{ config('app.name', 'Laravel') }}</title> {{-- Dynamic Title --}}
    <style>
        /* Apply gradient background to the body */
        body {
            /* Blue-to-purple gradient */
            background: linear-gradient(to bottom right, #6a11cb 0%, #2575fc 100%);
            background-repeat: no-repeat;
            background-attachment: fixed;
        }
        .register-container { /* Renamed for clarity */
            min-height: 100vh; /* Full viewport height */
            padding-top: 2rem; /* Add some padding top */
            padding-bottom: 2rem; /* Add some padding bottom */
        }
        .register-card { /* Renamed for clarity */
            max-width: 500px; /* Slightly wider for register form */
            width: 100%;
            border-radius: 0.75rem; /* Rounded corners */
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); /* Slightly stronger shadow */
            background-color: rgba(255, 255, 255, 0.95); /* Slightly transparent white */
            backdrop-filter: blur(5px); /* Optional: Blur effect */
            -webkit-backdrop-filter: blur(5px); /* Safari support */
            border: none;
        }
        /* Style form controls */
        .form-control-lg {
             background-color: rgba(255, 255, 255, 0.8);
        }
        .form-control-lg:focus {
             background-color: rgba(255, 255, 255, 0.9);
        }
        /* Adjust error message styling */
        .invalid-feedback {
            display: block; /* Make sure errors are visible */
            width: 100%;
            margin-top: .25rem;
            font-size: .875em;
            color: #dc3545; /* Bootstrap's danger color */
        }
        /* Style links */
        .already-registered-link {
             font-size: 0.9rem;
        }
    </style>
</head>
<body>

    {{-- Main container to center the register card --}}
    <div class="container d-flex justify-content-center align-items-center register-container p-3 p-md-4">

        {{-- Register Card --}}
        <div class="card register-card">
            <div class="card-body p-4 p-sm-5">
                {{-- Card Title --}}
                <h2 class="card-title text-center fw-bold mb-4">{{ __('Create Account') }}</h2>

                {{-- Register Form with Laravel action and CSRF token --}}
                <form method="POST" action="{{ route('register') }}">
                    @csrf {{-- CSRF Protection Token --}}

                    {{-- Name Field --}}
                    <div class="mb-3">
                        <label for="name" class="form-label">{{ __('Name') }}</label>
                        <input
                            type="text"
                            {{-- Add 'is-invalid' class if there's a name error --}}
                            class="form-control form-control-lg @error('name') is-invalid @enderror"
                            id="name"
                            name="name"
                            {{-- Use old('name') to repopulate field on validation error --}}
                            value="{{ old('name') }}"
                            required
                            autofocus
                            autocomplete="name"
                            placeholder="{{ __('e.g., John Doe') }}"
                        >
                        {{-- Display name validation errors --}}
                        @error('name')
                            <div class="invalid-feedback">
                                {{ $message }}
                            </div>
                        @enderror
                    </div>

                    {{-- Email Address Field --}}
                    <div class="mb-3">
                        <label for="email" class="form-label">{{ __('Email') }}</label>
                        <input
                            type="email"
                            {{-- Add 'is-invalid' class if there's an email error --}}
                            class="form-control form-control-lg @error('email') is-invalid @enderror"
                            id="email"
                            name="email"
                            value="{{ old('email') }}"
                            required
                            autocomplete="username" {{-- Standard autocomplete hint --}}
                            placeholder="{{ __('e.g., yourname@example.com') }}"
                        >
                        {{-- Display email validation errors --}}
                        @error('email')
                            <div class="invalid-feedback">
                                {{ $message }}
                            </div>
                        @enderror
                    </div>

                    {{-- Password Field --}}
                    <div class="mb-3">
                        <label for="password" class="form-label">{{ __('Password') }}</label>
                        <input
                            type="password"
                             {{-- Add 'is-invalid' class if there's a password error --}}
                            class="form-control form-control-lg @error('password') is-invalid @enderror"
                            id="password"
                            name="password"
                            required
                            autocomplete="new-password" {{-- Hint for password managers --}}
                            placeholder="{{ __('Choose a strong password') }}"
                        >
                         {{-- Display password validation errors --}}
                         @error('password')
                            <div class="invalid-feedback">
                                {{ $message }}
                            </div>
                        @enderror
                    </div>

                    {{-- Confirm Password Field --}}
                    <div class="mb-4"> {{-- Increased bottom margin before actions --}}
                        <label for="password_confirmation" class="form-label">{{ __('Confirm Password') }}</label>
                        <input
                            type="password"
                            {{-- Error check uses 'password_confirmation' --}}
                            class="form-control form-control-lg @error('password_confirmation') is-invalid @enderror"
                            id="password_confirmation"
                            name="password_confirmation" {{-- Name must match validation rule --}}
                            required
                            autocomplete="new-password"
                            placeholder="{{ __('Repeat your password') }}"
                        >
                         {{-- Display confirmation validation errors --}}
                         @error('password_confirmation')
                            <div class="invalid-feedback">
                                {{ $message }}
                            </div>
                        @enderror
                    </div>


                    {{-- Actions Row (Already Registered? and Button) --}}
                    <div class="d-flex flex-column flex-sm-row justify-content-sm-between align-items-sm-center gap-3">
                         {{-- Already Registered? Link --}}
                         <a class="text-decoration-none already-registered-link order-sm-1 text-center text-sm-start" href="{{ route('login') }}">
                            {{ __('Already registered?') }}
                        </a>

                        {{-- Submit Button --}}
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

    {{-- Include Bootstrap JS Bundle (includes Popper) via CDN --}}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

</body>
</html>

{{-- End layout section if using @extends --}}
{{-- Example: @endsection --}}

{{-- OR close the layout component if using <x-guest-layout> --}}
{{-- </x-guest-layout> --}}
