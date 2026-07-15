<?php

namespace Database\Seeders;

use App\Models\PortalUser;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed portal_users with default accounts matching login.js credentials.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'System Administrator',
                'email' => 'admin123@dnsc.edu.ph',
                'role' => 'admin',
                'dept' => 'IT Department',
                'status' => 'Active',
            ],
            [
                'name' => 'NSTP Coordinator',
                'email' => 'coordinator@dnsc.edu.ph',
                'role' => 'coordinator',
                'dept' => 'NSTP Office',
                'status' => 'Active',
            ],
            [
                'name' => 'Sample Instructor',
                'email' => 'instructor@dnsc.edu.ph',
                'role' => 'instructor',
                'dept' => 'CWTS',
                'status' => 'Active',
            ],
            [
                'name' => 'ROTC Officer',
                'email' => 'rotc@dnsc.edu.ph',
                'role' => 'rotc',
                'dept' => 'ROTC',
                'status' => 'Active',
            ],
        ];

        foreach ($users as $user) {
            PortalUser::updateOrCreate(
                ['email' => $user['email']],
                array_merge($user, ['password' => Hash::make('password')])
            );
        }
    }
}
