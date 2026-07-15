<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * php artisan nstp:reset
 *
 * Wipes all operational display data for the Coordinator, Instructor, and
 * ROTC Officer portals while preserving Admin user accounts and all Laravel
 * system tables (migrations, cache, jobs, failed_jobs).
 *
 * Run with --force to skip the interactive confirmation prompt (useful in
 * scripts / CI pipelines).
 */
class ResetPortalDataCommand extends Command
{
    protected $signature   = 'nstp:reset {--force : Skip confirmation prompt}';
    protected $description = 'Reset all portal display data (Coordinator / Instructor / ROTC) while keeping Admin accounts intact';

    public function handle(): int
    {
        // ── Safety guard ──────────────────────────────────────────────────────
        if (! $this->option('force')) {
            $this->warn('⚠  This will permanently delete ALL operational data across the three portals.');
            $this->warn('   Admin user accounts will be PRESERVED. Everything else will be wiped.');
            $this->newLine();

            if (! $this->confirm('Are you sure you want to continue?')) {
                $this->info('Reset cancelled — no changes were made.');
                return self::SUCCESS;
            }
        }

        // ── Pre-wipe admin count check ────────────────────────────────────────
        $adminCount = Schema::hasTable('users')
            ? DB::table('users')->where('role', 'Admin')->count()
            : 0;

        if ($adminCount === 0) {
            $this->error('No Admin accounts found in the users table. Aborting reset to prevent lockout.');
            return self::FAILURE;
        }

        $this->info("Found {$adminCount} Admin account(s) — these will be preserved.");
        $this->newLine();

        // ── Execute wipe ──────────────────────────────────────────────────────
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');

        try {
            // ── COORDINATOR PORTAL ────────────────────────────────────────────

            // 1a. Instructors & ROTC Officers Section
            //     Delete every non-Admin user account (instructors, ROTC officers).
            $deleted = DB::table('users')->where('role', '<>', 'Admin')->delete();
            $this->line("  ✔ users (non-admin)          → {$deleted} row(s) removed");

            // 1b. Report & Activity Approvals
            $this->truncateIfExists('activity_plans',         'activity_plans (approvals)');
            $this->truncateIfExists('accomplishment_reports',  'accomplishment_reports');

            // 1c. Activity Calendar (all components)
            $this->truncateIfExists('activities',              'activities (calendar)');

            // 1d. Certificate Templates — uncomment if table exists
            // $this->truncateIfExists('certificate_templates', 'certificate_templates');
            // $this->truncateIfExists('certificate_batches',   'certificate_batches');

            // ── INSTRUCTOR INTERFACE ──────────────────────────────────────────

            // 2b. Your Sections / My Classes / Rosters
            $this->truncateIfExists('enrollments',  'enrollments');
            $this->truncateIfExists('sections',     'sections');

            // 2c. Submission Tracker / Attendance
            $this->truncateIfExists('attendance',   'attendance');

            // 2g. Announcements
            $this->truncateIfExists('announcements', 'announcements');

            // ── ROTC OFFICER INTERFACE ────────────────────────────────────────

            // 3c. Platoon Management / Cadet Rosters
            //     Wipes ALL students across every component (CWTS, LTS, ROTC).
            $this->truncateIfExists('students', 'students (all components)');

            // 3e. Activity Designs — uncomment if dedicated table exists
            // $this->truncateIfExists('activity_designs', 'activity_designs');

            // 3f. Report Uploads — uncomment if dedicated table exists
            // $this->truncateIfExists('report_uploads', 'report_uploads');

            // ── SHARED AUDIT / LOG TABLES ─────────────────────────────────────

            if (Schema::hasTable('portal_audit_logs')) {
                $deleted = DB::table('portal_audit_logs')
                    ->where(function ($q) {
                        $q->whereNull('role')
                          ->orWhereIn(DB::raw('LOWER(role)'), [
                              'coordinator', 'instructor', 'rotcofficer', 'rotc',
                          ]);
                    })
                    ->delete();
                $this->line("  ✔ portal_audit_logs          → {$deleted} non-admin row(s) removed");
            }

            $this->truncateIfExists('audit_logs', 'audit_logs (legacy)');

            if (Schema::hasTable('notifications')) {
                $deleted = DB::table('notifications')
                    ->where(function ($q) {
                        $q->whereNull('role')
                          ->orWhereNotIn(DB::raw('LOWER(role)'), ['admin', 'administrator']);
                    })
                    ->delete();
                $this->line("  ✔ notifications              → {$deleted} non-admin row(s) removed");
            }

        } finally {
            DB::statement('SET FOREIGN_KEY_CHECKS = 1');
        }

        // ── Post-wipe verification ────────────────────────────────────────────
        $this->newLine();
        $this->info('Post-wipe verification:');

        $survivingAdmins = Schema::hasTable('users')
            ? DB::table('users')->where('role', 'Admin')->count()
            : 0;

        $nonAdmins = Schema::hasTable('users')
            ? DB::table('users')->where('role', '<>', 'Admin')->count()
            : 0;

        $this->line("  Admin accounts remaining  : {$survivingAdmins}");
        $this->line("  Non-admin accounts left   : {$nonAdmins}");

        $tables = ['students', 'sections', 'enrollments', 'attendance',
                   'activity_plans', 'accomplishment_reports', 'activities', 'announcements'];

        foreach ($tables as $tbl) {
            if (Schema::hasTable($tbl)) {
                $cnt = DB::table($tbl)->count();
                $mark = $cnt === 0 ? '✔' : '✘ NOT EMPTY';
                $this->line("  {$mark} {$tbl}: {$cnt} rows");
            }
        }

        $this->newLine();

        if ($nonAdmins > 0) {
            $this->warn("⚠  {$nonAdmins} non-admin user account(s) could not be removed. Check for FK constraints.");
            return self::FAILURE;
        }

        $this->info('✅  Portal data reset complete. All Admin accounts are intact.');

        return self::SUCCESS;
    }

    /**
     * TRUNCATE a table only if it exists — silently skips missing tables.
     */
    private function truncateIfExists(string $table, string $label): void
    {
        if (! Schema::hasTable($table)) {
            $this->line("  – {$label}: table not found (skipped)");
            return;
        }

        DB::table($table)->truncate();
        $this->line("  ✔ {$label}: truncated");
    }
}
