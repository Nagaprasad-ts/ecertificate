<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('import_batches', function (Blueprint $table) {
            $table->uuid('batch_id')->primary();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('template_id')->constrained()->cascadeOnDelete();
            $table->foreignId('imported_by')->constrained('users')->cascadeOnDelete();
            $table->integer('participant_count')->default(0);
            $table->integer('failed_count')->default(0);
            // Admin sets this window to authorize email sending
            $table->timestamp('email_window_from')->nullable();
            $table->timestamp('email_window_to')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('import_batches');
    }
};
