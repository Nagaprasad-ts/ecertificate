<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->foreignId('event_edition_id')
                ->nullable()
                ->after('event_id')
                ->constrained('event_editions')
                ->cascadeOnDelete();

            // Make existing event_id nullable so legacy data doesn't break
            $table->unsignedBigInteger('event_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->dropForeign(['event_edition_id']);
            $table->dropColumn('event_edition_id');
        });
    }
};
