<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Portal users (instructors, coordinators, etc.) — no dependencies
        $this->call(UserSeeder::class);

        // 2. Sections — depends on portal_users (instructor_id FK)
        $this->call(SectionSeeder::class);

        // 3. Students + enrollment sync — depends on sections
        $this->call(StudentSeeder::class);

        // 4. Standalone domain data — no inter-seeder dependencies
        $this->call(AnnouncementSeeder::class);
        $this->call(ActivitySeeder::class);

        // 5. Audit logs — depends on portal_users existing
        $this->call(PortalAuditLogSeeder::class);
    }
}
