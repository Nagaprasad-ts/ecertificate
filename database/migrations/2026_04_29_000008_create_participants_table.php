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
            $table->foreignId('event_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('event_edition_id')->nullable(); // FK to event_editions — constrained after that table exists
            $table->foreignId('template_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('usn')->nullable();
            $table->string('phone_no')->nullable();
            $table->string('certificate_no')->unique();
            $table->json('data')->nullable();
            $table->string('status')->default('active');
            $table->uuid('batch_id')->nullable()->index();
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
