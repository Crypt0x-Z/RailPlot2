<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use App\Models\User; // If needed

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): View
    {
        return view('auth.login');
    }
    
    

    /**
     * Handle an incoming authentication request.
     */


    public function store(LoginRequest $request)
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Check if user is admin
        if (auth()->user()->role == "admin") {
            return redirect()->route('admin.users.index');
        }

        // Otherwise, normal user
        return redirect()->intended(RouteServiceProvider::HOME);
    }


    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
