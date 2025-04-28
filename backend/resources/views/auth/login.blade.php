{{-- Use your main layout or a guest layout if you have one --}}
{{-- Example: <x-guest-layout> or @extends('layouts.app') --}}

{{-- If not using a layout, you'll need the full HTML structure --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    {{-- Include Bootstrap CSS via CDN --}}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    {{-- Favicon (optional) --}}
    <link rel="icon" href="https://placehold.co/32x32/0d6efd/ffffff?text=L" type="image/png">
    <title>Login - Laravel</title>
    <style>

    /* Navbar styling */
        .navbar {
            /* Optional: Add a subtle shadow or background */
             background-color: rgba(0, 0, 0, 0.2); /* Semi-transparent dark */
             backdrop-filter: blur(5px);
             -webkit-backdrop-filter: blur(5px);
        }
        .navbar-brand {
            font-weight: bold;
            font-size: 1.5rem; /* Adjust size as needed */
        }
        /* Apply gradient background to the body */
        body {
            /* Blue-to-purple gradient */
            background: linear-gradient(to bottom right, #6a11cb 0%, #2575fc 100%);
            background-repeat: no-repeat;
            background-attachment: fixed;
        }
        .login-container {
            min-height: 100vh; /* Full viewport height */
        }
        .login-card {
            max-width: 450px; /* Max width for the login card */
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
        /* Style form check (Remember Me) */
        .form-check-input {
            border-color: #adb5bd;
        }
        .form-check-label {
            color: #495057;
        }
        /* Ensure links look good */
        .forgot-password-link {
            font-size: 0.9rem;
        }
        /* Adjust error message styling */
        .invalid-feedback {
            display: block; /* Make sure errors are visible */
            width: 100%;
            margin-top: .25rem;
            font-size: .875em;
            color: #dc3545; /* Bootstrap's danger color */
        }
        /* Style session status (using Bootstrap alert for consistency) */
        .alert-session-status {
             /* Customizations if needed, otherwise Bootstrap's .alert-success works */
             padding: 0.75rem 1rem;
             margin-bottom: 1rem;
             border: 1px solid transparent;
             border-radius: .375rem; /* Bootstrap 5 default */
             color: #0f5132;
             background-color: #d1e7dd;
             border-color: #badbcc;
        }
    </style>
</head>
<body>

    {{-- Top Navigation Bar --}}
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top"> {{-- Added fixed-top --}}
        <div class="container-fluid justify-content-center"> {{-- Center content within navbar --}}
            {{-- Centered Brand with Logo Placeholder --}}
            <a class="navbar-brand d-flex align-items-center" href="#"> {{-- Add link if needed --}}
                {{-- Brand Text --}}
                <span>RailPlot</span>
            </a>
        </div>
    </nav>

    {{-- Main container to center the login card --}}
    <div class="container d-flex justify-content-center align-items-center login-container p-4">

        {{-- Login Card --}}
        <div class="card login-card">
            <div class="card-body p-4 p-sm-5">
                {{-- Card Title --}}
                <h2 class="card-title text-center fw-bold mb-4">Welcome Back!</h2>

                {{-- Session Status (Displays messages like password reset success) --}}
                {{-- Use the x-component or manually create the alert --}}
                @if (session('status'))
                    <div class="alert alert-session-status" role="alert">
                        {{ session('status') }}
                    </div>
                @endif
                {{-- OR if you prefer the component: --}}
                {{-- <x-auth-session-status class="mb-3 alert-session-status" :status="session('status')" /> --}}


                {{-- Login Form with Laravel action and CSRF token --}}
                <form method="POST" action="{{ route('login') }}">
                    @csrf {{-- CSRF Protection Token --}}

                    {{-- Email Address Field --}}
                    <div class="mb-3">
                        <label for="email" class="form-label">{{ __('Email') }}</label>
                        <input
                            type="email"
                            {{-- Add 'is-invalid' class if there's an email error --}}
                            class="form-control form-control-lg @error('email') is-invalid @enderror"
                            id="email"
                            name="email"
                            {{-- Use old('email') to repopulate field on validation error --}}
                            value="{{ old('email') }}"
                            required
                            autofocus
                            autocomplete="username"
                            placeholder="e.g., yourname@example.com"
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
                            autocomplete="current-password"
                            placeholder="Enter your password"
                        >
                         {{-- Display password validation errors --}}
                         @error('password')
                            <div class="invalid-feedback">
                                {{ $message }}
                            </div>
                        @enderror
                    </div>

                    {{-- Remember Me & Forgot Password Row --}}
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        {{-- Remember Me Checkbox --}}
                        <div class="form-check">
                            <input id="remember_me" type="checkbox" class="form-check-input" name="remember">
                            <label class="form-check-label" for="remember_me">{{ __('Remember me') }}</label>
                        </div>

                        {{-- Forgot Password Link (Only show if route exists) --}}
                        @if (Route::has('password.request'))
                            <a class="text-decoration-none forgot-password-link" href="{{ route('password.request') }}">
                                {{ __('Forgot your password?') }}
                            </a>
                        @endif
                    </div>


                    {{-- Submit Button --}}
                    <div class="d-grid mb-3">
                        <button type="submit" class="btn btn-primary btn-lg fw-semibold">
                            {{ __('Log in') }} {{-- Use translation helper --}}
                        </button>
                    </div>

                     {{-- Sign Up Link (Only show if route exists) --}}
                     @if (Route::has('register'))
                        <div class="text-center mt-4">
                            <p class="text-muted">
                                Don't have an account?
                                <a href="{{ route('register') }}" class="fw-medium text-decoration-none">{{ __('Sign Up') }}</a>
                            </p>
                        </div>
                     @endif
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
