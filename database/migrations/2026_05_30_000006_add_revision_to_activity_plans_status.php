<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE activity_plans MODIFY COLUMN status ENUM('Draft', 'Pending', 'Approved', 'Rejected', 'Revision') NOT NULL DEFAULT 'Pending'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE activity_plans MODIFY COLUMN status ENUM('Draft', 'Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending'");
    }
};
