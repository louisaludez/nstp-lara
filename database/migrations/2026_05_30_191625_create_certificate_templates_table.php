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
        Schema::create('certificate_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('component'); // CWTS, LTS, ROTC, ALL
            $table->string('bg_theme')->default('classic'); // classic, elegant, modern, military
            $table->string('title_text')->default('Certificate of Completion');
            $table->text('body_text');
            $table->string('signatory_name');
            $table->string('signatory_title');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificate_templates');
    }
};
