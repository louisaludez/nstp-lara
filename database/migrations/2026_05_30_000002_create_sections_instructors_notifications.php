<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Portal Users (instructors / coordinators) ─────────────────────
        if (!Schema::hasTable('portal_users')) {
            Schema::create('portal_users', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->string('password')->default('');
                $table->enum('role', ['admin', 'coordinator', 'instructor', 'rotc'])->default('instructor');
                $table->string('dept')->default('General');
                $table->string('status')->default('Active');
                $table->string('contact')->nullable();
                $table->timestamps();
            });
        }

        // ── Sections ──────────────────────────────────────────────────────
        if (!Schema::hasTable('sections')) {
            Schema::create('sections', function (Blueprint $table) {
                $table->id();
                $table->string('section_name')->unique();
                $table->enum('component', ['CWTS', 'LTS', 'ROTC'])->default('CWTS');
                $table->string('school_year')->default('2025-2026');
                $table->string('semester')->default('1st');
                $table->string('room')->default('TBA');
                $table->string('schedule')->nullable();
                $table->string('status')->default('Active');
                $table->foreignId('instructor_id')->nullable()->constrained('portal_users')->nullOnDelete();
                $table->timestamps();
            });
        }

        // ── Notifications ─────────────────────────────────────────────────
        if (!Schema::hasTable('portal_notifications')) {
            Schema::create('portal_notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('portal_users')->cascadeOnDelete();
                $table->string('type')->default('assignment');   // assignment | announcement | system
                $table->string('title');
                $table->text('message');
                $table->boolean('is_read')->default(false);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('portal_notifications');
        Schema::dropIfExists('sections');
        Schema::dropIfExists('portal_users');
    }
};
