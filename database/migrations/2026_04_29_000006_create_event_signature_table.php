<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_signature', function (Blueprint $table) {
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('signature_id')->constrained()->cascadeOnDelete();
            $table->primary(['event_id', 'signature_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_signature');
    }
};
