<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PortalUser;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AdminController extends Controller
{
    /**
     * Display the Admin Accounts page.
     */
    public function accounts()
    {
        $accounts = PortalUser::all()->map(function ($user) {
            $user->fullName = $user->name;
            $user->label = match ($user->role) {
                'admin' => 'System Administrator',
                'coordinator' => 'NSTP Coordinator',
                'instructor' => 'CWTS/LTS Instructor',
                'rotc' => 'ROTC Officer',
                default => 'User'
            };
            $user->degreeTitle = $user->degree_title;
            $user->ico = match ($user->role) {
                'admin' => 'shield',
                'coordinator' => 'grad',
                'instructor' => 'book',
                'rotc' => 'shield',
                default => 'users'
            };
            $user->grad = match ($user->role) {
                'admin' => 'from-slate-800 to-slate-900',
                'coordinator' => 'from-indigo-600 to-blue-500',
                'instructor' => 'from-emerald-500 to-teal-500',
                'rotc' => 'from-slate-800 to-slate-900',
                default => 'from-purple-500 to-purple-700'
            };
            return $user;
        });

        return view('admin.accounts', compact('accounts'));
    }

    /**
     * Store a newly created account in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:portal_users',
            'contact' => 'nullable|string|max:20',
            'role' => 'required|in:coordinator,instructor,rotc,admin',
            'degree' => 'nullable|string|max:255',
            'degree_title' => 'nullable|string|max:255',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        PortalUser::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'contact' => $validated['contact'],
            'role' => $validated['role'],
            'degree' => $validated['degree'],
            'degree_title' => $validated['degree_title'],
            'password' => Hash::make($validated['password']),
            'status' => 'Active',
            'dept' => match ($validated['role']) {
                'coordinator' => 'NSTP Office',
                'instructor' => 'CWTS',
                'rotc' => 'ROTC',
                'admin' => 'IT Department',
                default => 'General'
            }
        ]);

        return redirect()->route('admin.accounts')->with('success', 'Account created successfully!');
    }
}
