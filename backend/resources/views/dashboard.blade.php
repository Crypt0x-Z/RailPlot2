{{-- Use your main application layout --}}
{{-- Example: @extends('layouts.app') --}}
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
    <link rel="icon" href="https://placehold.co/32x32/6a11cb/ffffff?text=D" type="image/png"> {{-- Updated favicon color --}}
    <title>{{ __('Dashboard') }} - {{ config('app.name', 'Laravel') }}</title>
    <style>
        /* Apply gradient background from login/register page */
        body {
            background: linear-gradient(to bottom right, #6a11cb 0%, #2575fc 100%);
            background-repeat: no-repeat;
            background-attachment: fixed;
            min-height: 100vh; /* Ensure gradient covers full height */
        }
        /* Style the card like login/register */
        .dashboard-card {
            border-radius: 0.75rem; /* Rounded corners */
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); /* Shadow */
            background-color: rgba(255, 255, 255, 0.95); /* Slightly transparent white */
            backdrop-filter: blur(5px); /* Optional: Blur effect */
            -webkit-backdrop-filter: blur(5px); /* Safari support */
            border: none;
        }
        /* Style the header to fit the theme */
        .dashboard-header {
             background-color: rgba(255, 255, 255, 0.8); /* Semi-transparent white header */
             backdrop-filter: blur(3px);
             -webkit-backdrop-filter: blur(3px);
             box-shadow: 0 2px 4px rgba(0,0,0,.05); /* Softer shadow */
        }
         .dashboard-header h2 {
             color: #343a40; /* Darker text for header */
         }
        /* Ensure card text is readable */
        .dashboard-card .card-text, .dashboard-card .fs-5 {
            color: #212529; /* Default dark text color */
        }
        /* Style logout button/link */
        .logout-link {
             color: #dc3545; /* Bootstrap danger color */
             text-decoration: none;
             font-weight: 500;
        }
        .logout-link:hover {
             color: #a71d2a; /* Darker red on hover */
             text-decoration: underline;
        }
        .logout-link svg {
             vertical-align: text-bottom; /* Align icon better with text */
        }

    </style>
    {{-- Include any CSS pushed from the layout --}}
    {{-- @stack('styles') --}}
</head>
<body>

    {{-- Assume layout includes navigation --}}
    {{-- Example: @include('layouts.navigation') --}}

    {{-- Main Page Content --}}
    <main>
        {{-- Main content area --}}
        <div class="py-5">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-10 col-lg-8">
                        <div class="card dashboard-card"> {{-- Applied updated card class --}}
                            <div class="card-body p-4 p-md-5">

                                {{-- Logged in message --}}
                                <p class="card-text fs-5 mb-4">
                                    {{ __("You're logged in!") }}
                                </p>

                                {{-- Logout Form --}}
                                <form method="POST" action="{{ route('logout') }}" class="d-inline-block">
                                    @csrf {{-- CSRF Token --}}

                                    {{-- Logout Button styled as a link --}}
                                    <button type="submit" class="btn btn-link logout-link p-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-right me-1" viewBox="0 0 16 16">
                                            <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                                            <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                                        </svg>
                                        {{ __('Log Out') }}
                                    </button>
                                </form>

                            </div> {{-- End card-body --}}
                        </div> {{-- End card --}}
                    </div> {{-- End col --}}
                </div> {{-- End row --}}
            </div> {{-- End container --}}
        </div> {{-- End py-5 --}}
    </main>

    {{-- Optional: Footer Section --}}
    {{-- <footer class="mt-auto py-3 bg-light"> ... </footer> --}}

    {{-- Include Bootstrap JS Bundle --}}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    {{-- Include any JS pushed from the layout --}}
    {{-- @stack('scripts') --}}
</body>
</html>

{{-- End layout section if using @extends --}}
{{-- Example: @endsection --}}
