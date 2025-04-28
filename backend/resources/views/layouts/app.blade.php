<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Station Master</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gray-100 text-gray-900">
    <div class="min-h-screen flex flex-col">
        <header class="bg-white shadow">
            <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                Station Master Admin
            </div>
        </header>

        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit">
                Log Out
            </button>
        </form>


        <!-- Page Content -->
        <main class="flex-grow p-6">
            @yield('content')
        </main>

        <footer class="bg-white text-center py-4 shadow mt-auto">
            &copy; 2025 Station Master
        </footer>
    </div>
</body>
</html>
