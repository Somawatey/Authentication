<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Authenticate the user
        $request->authenticate();

        // Regenerate the session
        $request->session()->regenerate();

        $user = Auth::user();

        // If the user has 2FA enabled and has not yet confirmed this session, redirect to 2FA challenge
        if ($user->two_factor_secret && !$request->session()->get('auth.two_factor_confirmed')) {
            // Log out temporarily
            Auth::logout();

            // Store the user ID in session so we can identify them during 2FA challenge
            $request->session()->put('login.id', $user->getKey());

            // Redirect to the 2FA challenge route
            return redirect()->route('two-factor.login');
        }

        // If no 2FA is required or already confirmed, go to intended page
        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Log the user out and destroy session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
