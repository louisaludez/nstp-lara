<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE accomplishment_reports MODIFY COLUMN status ENUM('Draft', 'Pending', 'Reviewed', 'Revision', 'Rejected') NOT NULL DEFAULT 'Pending'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE accomplishment_reports MODIFY COLUMN status ENUM('Draft', 'Pending', 'Reviewed', 'Revision') NOT NULL DEFAULT 'Pending'");
    }
};
