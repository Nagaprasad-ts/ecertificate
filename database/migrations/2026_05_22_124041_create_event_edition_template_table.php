<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_edition_template', function (Blueprint $table) {
            $table->foreignId('event_edition_id')->constrained('event_editions')->cascadeOnDelete();
            $table->foreignId('template_id')->constrained()->cascadeOnDelete();
            $table->primary(['event_edition_id', 'template_id']);
        });

        // Drop the now-redundant single template_id column from event_editions
        Schema::table('event_editions', function (Blueprint $table) {
            $table->dropForeign(['template_id']);
            $table->dropColumn('template_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_edition_template');

        Schema::table('event_editions', function (Blueprint $table) {
            $table->foreignId('template_id')->nullable()->constrained()->cascadeOnDelete();
        });
    }
};
