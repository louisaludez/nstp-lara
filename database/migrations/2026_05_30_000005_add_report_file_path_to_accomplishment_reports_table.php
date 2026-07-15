<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('accomplishment_reports', function (Blueprint $table) {
            if (!Schema::hasColumn('accomplishment_reports', 'report_file_path')) {
                $table->string('report_file_path')->nullable()->after('accomplishments');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('accomplishment_reports', function (Blueprint $table) {
            if (Schema::hasColumn('accomplishment_reports', 'report_file_path')) {
                $table->dropColumn('report_file_path');
            }
        });
    }
};
