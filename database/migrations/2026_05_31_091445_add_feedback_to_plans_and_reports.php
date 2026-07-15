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
        Schema::table('activity_plans', function (Blueprint $table) {
            $table->text('feedback')->nullable()->after('status');
        });
        Schema::table('accomplishment_reports', function (Blueprint $table) {
            $table->text('feedback')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_plans', function (Blueprint $table) {
            $table->dropColumn('feedback');
        });
        Schema::table('accomplishment_reports', function (Blueprint $table) {
            $table->dropColumn('feedback');
        });
    }
};
