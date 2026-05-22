<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('template_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('usn')->nullable();
            $table->string('phone_no')->nullable();
            // format: {event_name}-{year}-{hex} e.g. hackathon-2026-1a2b3c
            $table->string('certificate_no')->unique();
            $table->json('data')->nullable(); // extra fields from Excel as JSON
            // pending = imported but email not sent yet; active = confirmed
            $table->string('status')->default('active');
            $table->uuid('batch_id')->nullable()->index(); // groups a single import run
            $table->timestamps();

            $table->index(['event_id', 'email']);
            $table->index(['event_id', 'usn']);
            $table->index(['event_id', 'phone_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participants');
    }
};
