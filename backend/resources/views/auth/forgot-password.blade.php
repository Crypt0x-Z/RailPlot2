{{-- Use your guest layout --}}
{{-- Example: @extends('layouts.guest') or <x-guest-layout> --}}
{{-- If using a layout, put the main content inside @section('content') --}}

{{-- If not using a layout, you'll need the full HTML structure --}}
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    {{-- CSRF Token --}}
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- Include Bootstrap CSS via CDN --}}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    {{-- Favicon (optional) --}}
    <link rel="icon" href="https://placehold.co/32x32/6a11cb/ffffff?text=P" type="image/png"> {{-- Updated favicon color --}}
    <title>{{ __('Forgot Password') }} - {{ config('app.name', 'Laravel') }}</title>
    <style>
        /* Apply gradient background from login/register page */
        body {
            background: linear-gradient(to bottom right, #6a11cb 0%, #2575fc 100%);
            background-repeat: no-repeat;
            background-attachment: fixed;
            min-height: 100vh; /* Ensure gradient covers full height */
        }
        /* Style the card like login/register */
        .forgot-password-card { /* Specific class for this card */
            max-width: 500px; /* Consistent width */
            width: 100%;
            border-radius: 0.75rem; /* Rounded corners */
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); /* Shadow */
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
        /* Ensure card text is readable */
        .forgot-password-card .card-text {
            color: #495057; /* Slightly muted text color */
            font-size: 0.95rem;
            line-height: 1.5;
        }
        /* Adjust error message styling */
        .invalid-feedback {
            display: block;
            width: 100%;
            margin-top: .25rem;
            font-size: .875em;
            color: #dc3545;
        }
        /* Style session status (using Bootstrap alert) */
        .alert-session-status {
             padding: 0.75rem 1rem;
             margin-bottom: 1rem;
             border: 1px solid transparent;
             border-radius: .375rem;
             color: #0f5132; /* Success text color */
             background-color: #d1e7dd; /* Success background color */
             border-color: #badbcc; /* Success border color */
        }
    </style>
    {{-- Include any CSS pushed from the layout --}}
    {{-- @stack('styles') --}}
</head>
<body>

    {{-- Main container to center the card --}}
    <div class="container d-flex justify-content-center align-items-center min-vh-100 p-3 p-md-4">

        {{-- Forgot Password Card --}}
        <div class="card forgot-password-card">
            <div class="card-body p-4 p-sm-5">

                <h2 class="card-title text-center fw-bold mb-4">{{ __('Forgot Your Password?') }}</h2>

                {{-- Introductory Text --}}
                <p class="card-text mb-4">
                    {{ __('No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.') }}
                </p>

                {{-- Session Status (Displays success message after sending link) --}}
                @if (session('status'))
                    <div class="alert alert-session-status" role="alert">
                        {{ session('status') }}
                    </div>
                @endif
                {{-- OR use the component if preferred: --}}
                {{-- <x-auth-session-status class="mb-4 alert-session-status" :status="session('status')" /> --}}

                {{-- Forgot Password Form --}}
                <form method="POST" action="{{ route('password.email') }}">
                    @csrf {{-- CSRF Protection Token --}}

                    {{-- Email Address Field --}}
                    <div class="mb-3">
                        <label for="email" class="form-label">{{ __('Email') }}</label>
                        <input
                            type="email"
                            class="form-control form-control-lg @error('email') is-invalid @enderror"
                            id="email"
                            name="email"
                            value="{{ old('email') }}"
                            required
                            autofocus
                            placeholder="{{ __('yourname@example.com') }}"
                        >
                        {{-- Display email validation errors --}}
                        @error('email')
                            <div class="invalid-feedback">
                                {{ $message }}
                            </div>
                        @enderror
                    </div>

                    {{-- Submit Button --}}
                    <div class="d-grid mt-4">
                        <button type="submit" class="btn btn-primary btn-lg fw-semibold">
                            {{ __('Email Password Reset Link') }}
                        </button>
                    </div>

                     {{-- Optional: Back to Login Link --}}
                     @if (Route::has('login'))
                        <div class="text-center mt-4">
                            <a href="{{ route('login') }}" class="text-decoration-none">
                                {{ __('Back to Login') }}
                            </a>
                        </div>
                     @endif

                </form>
            </div> {{-- End card-body --}}
        </div> {{-- End card --}}
    </div> {{-- End container --}}

    {{-- Include Bootstrap JS Bundle --}}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    {{-- Include any JS pushed from the layout --}}
    {{-- @stack('scripts') --}}
</body>
</html>

{{-- End layout section if using @extends --}}
{{-- Example: @endsection --}}
