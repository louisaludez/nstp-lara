<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('portal_audit_logs')) {
            return;
        }

        Schema::create('portal_audit_logs', function (Blueprint $table) {
            $table->id();

            // Who performed the action
            $table->string('username')->nullable();           // display name (e.g. "Maya Reyes")
            $table->string('user_email')->nullable();         // email / user identifier
            $table->string('role')->nullable();               // coordinator | instructor | admin | rotc

            // What they did
            $table->string('action');                         // Created | Updated | Deleted | Logged In | Imported | Generated | …
            $table->string('action_type')->default('edit');   // edit | system | approval | submission | alert

            // Where / on what
            $table->string('module');                         // Students | Sections | Certificates | Reports | …
            $table->text('target')->nullable();               // human-readable subject  e.g. "CWTS-1A (32 students)"
            $table->text('details')->nullable();              // optional diff / extra context

            // When
            $table->timestamp('performed_at')->useCurrent(); // exact server timestamp
            $table->timestamps();                            // created_at / updated_at for housekeeping

            // Indexes for fast filtering / searching
            $table->index('user_email');
            $table->index('action_type');
            $table->index('module');
            $table->index('performed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portal_audit_logs');
    }
};
