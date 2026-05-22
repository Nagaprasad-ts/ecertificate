<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('event_logo');
        Schema::dropIfExists('event_signature');
        Schema::dropIfExists('event_template');
    }

    public function down(): void
    {
        Schema::create('event_logo', function (Blueprint $table) {
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('logo_id')->constrained()->cascadeOnDelete();
            $table->primary(['event_id', 'logo_id']);
        });

        Schema::create('event_signature', function (Blueprint $table) {
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('signature_id')->constrained()->cascadeOnDelete();
            $table->primary(['event_id', 'signature_id']);
        });

        Schema::create('event_template', function (Blueprint $table) {
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('template_id')->constrained()->cascadeOnDelete();
            $table->primary(['event_id', 'template_id']);
        });
    }
};
