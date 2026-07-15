<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $samples = [
            [
                'student_id' => '2024-00001',
                'first_name' => 'Maria Clara S.',
                'last_name'  => 'Reyes',
                'course'     => 'BSIT',
                'component'  => 'CWTS',
                'grade'      => 'pass',
                'section'    => 'CWTS-1A',
            ],
            [
                'student_id' => '2024-00002',
                'first_name' => 'Juan Miguel R.',
                'last_name'  => 'Santos',
                'course'     => 'BSIT',
                'component'  => 'CWTS',
                'grade'      => 'fail',
                'section'    => 'CWTS-1A',
            ],
        ];

        foreach ($samples as $row) {
            $section = $row['section'];
            unset($row['section']);

            Student::updateOrCreate(
                ['student_id' => $row['student_id']],
                array_merge($row, ['enrollment_status' => 'Active', 'created_at' => now()])
            );

            Student::syncEnrollment($row['student_id'], $section, $row['grade']);
        }

        if (! DB::table('sections')->where('section_name', 'CWTS-1A')->exists()) {
            DB::table('sections')->insert([
                'component'    => 'CWTS',
                'section_name' => 'CWTS-1A',
                'school_year'  => '2025-2026',
                'semester'     => '1st',
                'created_at'   => now(),
            ]);
            Student::syncEnrollment('2024-00001', 'CWTS-1A', 'pass');
            Student::syncEnrollment('2024-00002', 'CWTS-1A', 'fail');
        }
    }
}
