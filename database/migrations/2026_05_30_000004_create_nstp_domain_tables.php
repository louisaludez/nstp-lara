<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Students ──────────────────────────────────────────────────────
        if (!Schema::hasTable('students')) {
            Schema::create('students', function (Blueprint $table) {
                $table->id();
                $table->string('student_id', 50)->unique();
                $table->string('first_name', 50);
                $table->string('last_name', 50);
                $table->string('course', 50)->nullable();
                $table->integer('year_level')->nullable();
                $table->enum('component', ['CWTS', 'LTS', 'ROTC'])->nullable();
                $table->enum('enrollment_status', ['Active', 'Completed', 'Dropped'])->default('Active');
                $table->enum('grade', ['pass', 'fail'])->nullable()->comment('NSTP pass or fail status');
                $table->decimal('numerical_grade', 5, 2)->nullable()->comment('NSTP numerical grade');
                $table->date('date_of_birth')->nullable();
                $table->enum('sex', ['Male', 'Female'])->nullable();
                $table->string('contact_number', 20)->nullable();
                $table->string('email', 100)->nullable();
                $table->text('complete_address')->nullable();
                $table->timestamps();
            });
        }

        // ── Enrollments ───────────────────────────────────────────────────
        if (!Schema::hasTable('enrollments')) {
            Schema::create('enrollments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
                $table->foreignId('section_id')->constrained('sections')->cascadeOnDelete();
                $table->decimal('final_grade', 5, 2)->nullable();
                $table->enum('status', ['Pending', 'Passed', 'Failed', 'Dropped'])->default('Pending');
                $table->string('serial_number', 100)->nullable()->unique();
                $table->timestamps();
            });
        }

        // ── Activities ────────────────────────────────────────────────────
        if (!Schema::hasTable('activities')) {
            Schema::create('activities', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->enum('component', ['CWTS', 'LTS', 'ROTC'])->index();
                $table->date('activity_date');
                $table->time('activity_time');
                $table->string('location');
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        // ── Activity Plans ────────────────────────────────────────────────
        if (!Schema::hasTable('activity_plans')) {
            Schema::create('activity_plans', function (Blueprint $table) {
                $table->id();
                $table->foreignId('instructor_id')->constrained('portal_users')->cascadeOnDelete();
                $table->foreignId('section_id')->nullable()->constrained('sections')->nullOnDelete();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('location')->nullable();
                $table->date('scheduled_date')->nullable();
                $table->text('objectives')->nullable();
                $table->integer('files_attached')->default(0);
                $table->enum('status', ['Draft', 'Pending', 'Approved', 'Rejected'])->default('Pending')->index();
                $table->timestamp('submitted_date')->nullable()->useCurrent();
                $table->timestamps();
            });
        }

        // ── Accomplishment Reports ────────────────────────────────────────
        if (!Schema::hasTable('accomplishment_reports')) {
            Schema::create('accomplishment_reports', function (Blueprint $table) {
                $table->id();
                $table->foreignId('instructor_id')->constrained('portal_users')->cascadeOnDelete();
                $table->foreignId('section_id')->nullable()->constrained('sections')->nullOnDelete();
                $table->string('title');
                $table->string('location')->nullable();
                $table->date('completed_date')->nullable();
                $table->integer('participants_count')->default(0);
                $table->text('accomplishments')->nullable();
                $table->string('report_file_path')->nullable();
                $table->integer('files_attached')->default(0);
                $table->enum('status', ['Draft', 'Pending', 'Reviewed', 'Revision'])->default('Pending')->index();
                $table->timestamp('submitted_date')->nullable()->useCurrent();
                $table->timestamps();
            });
        }

        // ── Announcements ─────────────────────────────────────────────────
        if (!Schema::hasTable('announcements')) {
            Schema::create('announcements', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('content');
                $table->string('source', 100)->default('NSTP Office');
                $table->boolean('is_pinned')->default(false)->index();
                $table->string('target_role', 50)->default('All');
                $table->timestamps();
            });
        }

        // ── Attendance ────────────────────────────────────────────────────
        if (!Schema::hasTable('attendance')) {
            Schema::create('attendance', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
                $table->foreignId('section_id')->constrained('sections')->cascadeOnDelete();
                $table->date('date');
                $table->enum('status', ['Present', 'Absent', 'Late'])->index();
                $table->timestamps();
            });
        }

        // ── Notifications (legacy) ────────────────────────────────────────
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
                $table->string('role', 50)->nullable();
                $table->text('message');
                $table->string('link')->nullable();
                $table->boolean('is_read')->default(false)->index();
                $table->timestamps();
            });
        }

        // ── Audit Logs (legacy) ───────────────────────────────────────────
        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table) {
                $table->id();
                $table->string('action_type', 50)->index();
                $table->string('user_name', 100);
                $table->text('details');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('attendance');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('accomplishment_reports');
        Schema::dropIfExists('activity_plans');
        Schema::dropIfExists('activities');
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('students');
    }
};
