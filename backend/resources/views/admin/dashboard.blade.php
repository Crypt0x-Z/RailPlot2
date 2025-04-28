<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
                <h1 class="text-2xl font-bold">Admin Dashboard</h1>
                <p class="mt-4">Welcome, Admin!</p>
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit">
                        Log Out
                    </button>
                </form>

            </div>
        </div>
    </div>
</x-app-layout>
