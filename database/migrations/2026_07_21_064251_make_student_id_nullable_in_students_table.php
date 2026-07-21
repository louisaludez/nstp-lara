<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Only change the column to nullable.
        // The existing UNIQUE index is already present.
        DB::statement(
            'ALTER TABLE students MODIFY student_id VARCHAR(50) NULL'
        );
    }

    public function down(): void
    {
        // Change it back to NOT NULL.
        DB::statement(
            'ALTER TABLE students MODIFY student_id VARCHAR(50) NOT NULL'
        );
    }
};