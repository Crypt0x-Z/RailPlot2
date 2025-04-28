    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="icon" href="https://placehold.co/32x32/0d6efd/ffffff?text=L" type="image/png">
    <title>RailPlot - Login</title>
    <style>
        .navbar {
             background-color: rgba(0, 0, 0, 0.2);
             backdrop-filter: blur(5px);
             -webkit-backdrop-filter: blur(5px);
        }
        .navbar-brand {
            font-weight: bold;
            font-size: 1.5rem;
        }

        body {
            background: linear-gradient(to bottom right, #6a11cb 0%, #2575fc 100%);
            background-repeat: no-repeat;
            background-attachment: fixed;
        }
        .login-container {
            min-height: 100vh;
        }
        .login-card {
            max-width: 450px;
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

        .form-check-input {
            border-color: #adb5bd;
        }
        .form-check-label {
            color: #495057;
        }

        .forgot-password-link {
            font-size: 0.9rem;
        }

        .invalid-feedback {
            display: block;
            width: 100%;
            margin-top: .25rem;
            font-size: .875em;
            color: #dc3545;
        }

        .alert-session-status {
             padding: 0.75rem 1rem;
             margin-bottom: 1rem;
             border: 1px solid transparent;
             border-radius: .375rem;
             color: #0f5132;
             background-color: #d1e7dd;
             border-color: #badbcc;
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top">
        <div class="container-fluid justify-content-center">
            <a class="navbar-brand d-flex align-items-center" href="#">
                <span>RailPlot</span>
            </a>
        </div>
    </nav>
    <div class="container d-flex justify-content-center align-items-center login-container p-4">
        <div class="card login-card">
            <div class="card-body p-4 p-sm-5">
                <h2 class="card-title text-center fw-bold mb-4">Welcome Back!</h2>
                @if (session('status'))
                    <div class="alert alert-session-status" role="alert">
                        {{ session('status') }}
                    </div>
                @endif
                <form method="POST" action="{{ route('login') }}">
                    @csrf
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
                            autocomplete="username"
                            placeholder="e.g., yourname@example.com"
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
                            autocomplete="current-password"
                            placeholder="Enter your password"
                        >
                         @error('password')
                            <div class="invalid-feedback">
                                {{ $message }}
                            </div>
                        @enderror
                    </div>
                    <div class="d-grid mb-3">
                        <button type="submit" class="btn btn-primary btn-lg fw-semibold">
                            {{ __('Log in') }}
                        </button>
                    </div>
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
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

</body>
</html>