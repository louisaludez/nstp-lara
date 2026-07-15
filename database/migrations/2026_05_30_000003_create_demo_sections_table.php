<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('demo_sections')) {
            return;
        }

        Schema::create('demo_sections', function (Blueprint $table) {
            $table->id();
            $table->string('student_no', 50);
            $table->string('student_name');
            $table->string('program', 100);
            $table->foreignId('instructor_id')->nullable()->constrained('portal_users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demo_sections');
    }
};
