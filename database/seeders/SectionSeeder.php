<?php

namespace Database\Seeders;

use App\Models\Section;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    /**
     * Seed initial sections for each NSTP component.
     */
    public function run(): void
    {
        // Note: sections.instructor_id references the legacy `users` table (not portal_users).
        // Instructor assignment is handled via SectionController which sets instructor_id correctly.
        $sections = [
            // CWTS Sections
            [
                'component'    => 'CWTS',
                'section_name' => 'CWTS-1A',
                'school_year'  => '2025-2026',
                'semester'     => '1st',
                'instructor_id'=> null,
            ],
            [
                'component'    => 'CWTS',
                'section_name' => 'CWTS-1B',
                'school_year'  => '2025-2026',
                'semester'     => '1st',
                'instructor_id'=> null,
            ],
            [
                'component'    => 'CWTS',
                'section_name' => 'CWTS-2A',
                'school_year'  => '2025-2026',
                'semester'     => '1st',
                'instructor_id'=> null,
            ],
            // LTS Sections
            [
                'component'    => 'LTS',
                'section_name' => 'LTS-1A',
                'school_year'  => '2025-2026',
                'semester'     => '1st',
                'instructor_id'=> null,
            ],
            [
                'component'    => 'LTS',
                'section_name' => 'LTS-1B',
                'school_year'  => '2025-2026',
                'semester'     => '1st',
                'instructor_id'=> null,
            ],
            // ROTC Sections
            [
                'component'    => 'ROTC',
                'section_name' => 'ROTC-1A',
                'school_year'  => '2025-2026',
                'semester'     => '1st',
                'instructor_id'=> null,
            ],
        ];

        foreach ($sections as $section) {
            Section::updateOrCreate(
                ['section_name' => $section['section_name']],
                $section
            );
        }
    }
}
