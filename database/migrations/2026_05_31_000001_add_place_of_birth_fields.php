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
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'place_of_birth')) {
                $table->string('place_of_birth', 255)->nullable()->after('date_of_birth');
            }
        });

        Schema::table('class_list_students', function (Blueprint $table) {
            if (!Schema::hasColumn('class_list_students', 'place_of_birth')) {
                $table->string('place_of_birth', 255)->nullable()->after('dob');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'place_of_birth')) {
                $table->dropColumn('place_of_birth');
            }
        });

        Schema::table('class_list_students', function (Blueprint $table) {
            if (Schema::hasColumn('class_list_students', 'place_of_birth')) {
                $table->dropColumn('place_of_birth');
            }
        });
    }
};
