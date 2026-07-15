<?php

namespace Database\Seeders;

use App\Models\Announcement;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    /**
     * Seed sample pinned and regular announcements.
     */
    public function run(): void
    {
        $announcements = [
            [
                'title'       => 'Welcome to NSTP AY 2025-2026',
                'content'     => 'The NSTP Office welcomes all enrolled students to the Academic Year 2025-2026. Please check your assigned sections and report to your respective instructors.',
                'source'      => 'NSTP Office',
                'is_pinned'   => true,
                'target_role' => 'All',
            ],
            [
                'title'       => 'Submission of Activity Plans — Deadline Reminder',
                'content'     => 'All NSTP instructors are reminded to submit their Activity Plans for the 1st semester no later than June 15, 2025. Plans submitted after the deadline will be marked as late.',
                'source'      => 'NSTP Office',
                'is_pinned'   => true,
                'target_role' => 'instructor',
            ],
            [
                'title'       => 'ROTC Physical Fitness Test Schedule',
                'content'     => 'The ROTC Physical Fitness Test is scheduled on June 20, 2025 at the Parade Ground. All ROTC cadets are required to attend in complete uniform.',
                'source'      => 'ROTC Office',
                'is_pinned'   => false,
                'target_role' => 'rotc',
            ],
            [
                'title'       => 'Grade Encoding Now Open',
                'content'     => 'Grade encoding for NSTP 1 (1st semester, AY 2025-2026) is now open in the portal. Instructors are advised to encode grades before July 1, 2025.',
                'source'      => 'NSTP Office',
                'is_pinned'   => false,
                'target_role' => 'instructor',
            ],
            [
                'title'       => 'Community Service Activity — Barangay Cleanup',
                'content'     => 'A community service cleanup drive is scheduled on June 28, 2025. CWTS and LTS students will participate in coordination with the local barangay.',
                'source'      => 'NSTP Office',
                'is_pinned'   => false,
                'target_role' => 'All',
            ],
        ];

        foreach ($announcements as $a) {
            Announcement::updateOrCreate(
                ['title' => $a['title']],
                array_merge($a, ['created_at' => now()])
            );
        }
    }
}
