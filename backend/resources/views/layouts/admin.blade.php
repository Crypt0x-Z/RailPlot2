<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Station Master Admintest</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="font-sans antialiased">
    <div class="min-h-screen bg-gray-100">
        <header class="bg-white shadow">
            <div class="max-w-7xl mx-auto py-6 px-4">
                Admin Panel
            </div>
        </header>

        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit">
                Log Out
            </button>
        </form>

        <main class="py-6 px-4">
            @yield('content')
        </main>
    </div>
</body>
</html>
