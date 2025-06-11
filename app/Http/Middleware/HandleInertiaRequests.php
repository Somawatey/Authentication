<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? array_merge($request->user()->toArray(), [
                'two_factor_enabled' => !is_null($request->user()->two_factor_secret),
                'two_factor_confirmed' => !is_null($request->user()->two_factor_confirmed_at),
                'has_two_factor' => $request->user()->hasEnabledTwoFactorAuthentication(),
                'roles' => $request->user()->roles->map(function($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name
                    ];
                })
            ]) : null,
                'can' => $request->user()?->loadMissing('roles.permissions')
                    ->roles->flatMap(function ($role) {
                        return $role->permissions;
                    })->mapWithKeys(function ($permission) {
                        return [$permission['name'] => auth()->user()->can($permission['name'])];
                    })->all(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],
        ]);
    }

}
