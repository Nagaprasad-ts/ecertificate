<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropUnique(['event_name', 'year']);
            $table->dropColumn('year');
            $table->string('logo')->nullable()->after('event_name');
            $table->unique('event_name');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropUnique(['event_name']);
            $table->dropColumn('logo');
            $table->unsignedSmallInteger('year')->default(2026);
            $table->unique(['event_name', 'year']);
        });
    }
};
