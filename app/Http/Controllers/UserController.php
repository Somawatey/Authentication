<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Models\User;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->paginate(10)->appends(request()->query());
        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        $roles = Role::all();
        return Inertia::render('Users/CreateEdit', [
            'roles' => $roles
        ]);
    }

    public function store(Request $request)
{
    $validated = Validator::make($request->all(), [
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', Rule::unique('users')],
        'password' => ['required', 'string', 'min:8', 'confirmed'],
        'roles' => ['required', 'array'],
        'roles.*' => ['exists:roles,id']  // Changed to validate role IDs
    ])->validate();

    $user = User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => Hash::make($validated['password']),
    ]);

    // Update to use role IDs directly
    if (!empty($validated['roles'])) {
        $user->syncRoles($validated['roles']);
    }

    return to_route('users.index')
        ->with('success', 'User created successfully');
}

    public function edit($id)
    {
        $user = User::with(['roles'])->find($id);
        $roles = Role::all();

        return Inertia::render('Users/CreateEdit', [
            'roles' => $roles,
            'user' => $user
        ]);
    }

    public function update(Request $request, $id)
{
    $user = User::findOrFail($id);
    
    $validated = Validator::make($request->all(), [
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
        'roles' => ['required', 'array'],
        'roles.*' => ['exists:roles,id']
    ])->validate();

    $user->update([
        'name' => $validated['name'],
        'email' => $validated['email'],
    ]);

    $user->syncRoles($validated['roles']);

    return to_route('users.index')
        ->with('success', 'User updated successfully');
}

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return to_route('users.index')->with("success", "User Deleted successfully");
    }
}
