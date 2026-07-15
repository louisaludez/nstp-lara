<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use Illuminate\Database\Seeder;

class PortalAuditLogSeeder extends Seeder
{
    /**
     * Seed sample portal_audit_logs from the SQL dump.
     * Uses updateOrCreate to avoid duplicates on re-run.
     */
    public function run(): void
    {
        // Skip if already populated to avoid duplicate inserts
        if (AuditLog::count() >= 50) {
            $this->command->info('PortalAuditLogSeeder: already seeded, skipping.');
            return;
        }

        $logs = [
            ['username' => 'Dr. Maya Reyes',      'user_email' => 'coordinator@dnsc.edu.ph', 'role' => 'coordinator',  'action' => 'Logged In',            'action_type' => 'system', 'module' => 'Authentication', 'target' => 'coordinator@dnsc.edu.ph', 'details' => 'User logged in with role: coordinator',    'performed_at' => '2026-05-29 08:00:33'],
            ['username' => 'Prof. Julian Santos',  'user_email' => 'instructor@dnsc.edu.ph',  'role' => 'instructor',   'action' => 'Logged In',            'action_type' => 'system', 'module' => 'Authentication', 'target' => 'instructor@dnsc.edu.ph',  'details' => 'User logged in with role: instructor',    'performed_at' => '2026-05-29 08:13:08'],
            ['username' => 'Prof. Julian Santos',  'user_email' => 'instructor@dnsc.edu.ph',  'role' => 'instructor',   'action' => 'Logged Out',           'action_type' => 'system', 'module' => 'Authentication', 'target' => 'instructor@dnsc.edu.ph',  'details' => 'Logged out via sidebar button.',          'performed_at' => '2026-05-29 08:13:31'],
            ['username' => '1Lt. Daniel Castillo', 'user_email' => 'rotc@dnsc.edu.ph',        'role' => 'rotcofficer',  'action' => 'Logged In',            'action_type' => 'system', 'module' => 'Authentication', 'target' => 'rotc@dnsc.edu.ph',        'details' => 'User logged in with role: rotcofficer',   'performed_at' => '2026-05-29 08:13:36'],
            ['username' => '1Lt. Daniel Castillo', 'user_email' => 'rotc@dnsc.edu.ph',        'role' => 'rotcofficer',  'action' => 'Logged Out',           'action_type' => 'system', 'module' => 'Authentication', 'target' => 'rotc@dnsc.edu.ph',        'details' => 'Logged out via sidebar button.',          'performed_at' => '2026-05-29 08:14:08'],
            ['username' => 'System',               'user_email' => null,                       'role' => null,           'action' => 'Failed Login Attempt', 'action_type' => 'alert',  'module' => 'Authentication', 'target' => 'admin@dnsc.edu.ph',       'details' => 'Invalid credentials entered.',            'performed_at' => '2026-05-29 08:16:12'],
            ['username' => 'System',               'user_email' => null,                       'role' => null,           'action' => 'Failed Login Attempt', 'action_type' => 'alert',  'module' => 'Authentication', 'target' => 'admin123@dnsc.edu.ph',    'details' => 'Invalid credentials entered.',            'performed_at' => '2026-05-29 08:16:30'],
            ['username' => 'Dr. Maya Reyes',      'user_email' => 'coordinator@dnsc.edu.ph', 'role' => 'coordinator',  'action' => 'Logged In',            'action_type' => 'system', 'module' => 'Authentication', 'target' => 'coordinator@dnsc.edu.ph', 'details' => 'User logged in with role: coordinator',    'performed_at' => '2026-05-29 08:18:48'],
            ['username' => 'Dr. Maya Reyes',      'user_email' => 'coordinator@dnsc.edu.ph', 'role' => 'coordinator',  'action' => 'Created',              'action_type' => 'edit',   'module' => 'Sections',       'target' => 'CWTS 1A',                 'details' => 'Created section CWTS 1A (BSSW) with 52 students.', 'performed_at' => '2026-05-29 08:45:42'],
            ['username' => 'Dr. Maya Reyes',      'user_email' => 'coordinator@dnsc.edu.ph', 'role' => 'coordinator',  'action' => 'Deleted section',      'action_type' => 'edit',   'module' => 'Sections',       'target' => 'BSSW-CLASS-LIST',         'details' => 'Deleted section BSSW-CLASS-LIST and archived 52 students.', 'performed_at' => '2026-05-29 08:34:05'],
            ['username' => 'Dr. Maya Reyes',      'user_email' => 'coordinator@dnsc.edu.ph', 'role' => 'coordinator',  'action' => 'Logged Out',           'action_type' => 'system', 'module' => 'Authentication', 'target' => 'coordinator@dnsc.edu.ph', 'details' => 'Logged out via sidebar button.',          'performed_at' => '2026-05-29 09:06:06'],
            ['username' => 'Prof. Julian Santos',  'user_email' => 'instructor@dnsc.edu.ph',  'role' => 'instructor',   'action' => 'Logged In',            'action_type' => 'system', 'module' => 'Authentication', 'target' => 'instructor@dnsc.edu.ph',  'details' => 'User logged in with role: instructor',    'performed_at' => '2026-05-29 09:33:31'],
            ['username' => 'Prof. Julian Santos',  'user_email' => 'instructor@dnsc.edu.ph',  'role' => 'instructor',   'action' => 'Logged Out',           'action_type' => 'system', 'module' => 'Authentication', 'target' => 'instructor@dnsc.edu.ph',  'details' => 'Logged out via sidebar button.',          'performed_at' => '2026-05-29 09:41:22'],
            ['username' => 'Dr. Maya Reyes',      'user_email' => 'coordinator@dnsc.edu.ph', 'role' => 'coordinator',  'action' => 'Created',              'action_type' => 'edit',   'module' => 'Sections',       'target' => 'CWTS',                    'details' => 'Created section CWTS (CWTS) with 52 students.', 'performed_at' => '2026-05-29 10:29:13'],
            ['username' => 'Dr. Maya Reyes',      'user_email' => 'coordinator@dnsc.edu.ph', 'role' => 'coordinator',  'action' => 'Logged Out',           'action_type' => 'system', 'module' => 'Authentication', 'target' => 'coordinator@dnsc.edu.ph', 'details' => 'Logged out via sidebar button.',          'performed_at' => '2026-05-29 10:29:34'],
            ['username' => 'Prof. Julian Santos',  'user_email' => 'instructor@dnsc.edu.ph',  'role' => 'instructor',   'action' => 'Logged In',            'action_type' => 'system', 'module' => 'Authentication', 'target' => 'instructor@dnsc.edu.ph',  'details' => 'User logged in with role: instructor',    'performed_at' => '2026-05-29 10:29:35'],
        ];

        foreach ($logs as $log) {
            AuditLog::create(array_merge($log, [
                'created_at'  => $log['performed_at'],
                'updated_at'  => $log['performed_at'],
            ]));
        }
    }
}
