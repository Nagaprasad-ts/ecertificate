<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_logs', function (Blueprint $table) {
            if (! Schema::hasColumn('email_logs', 'sent_by')) {
                $table->foreignId('sent_by')->nullable()->after('id')->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('email_logs', 'bounced_at')) {
                $table->timestamp('bounced_at')->nullable()->after('sent_at');
            }
        });

        // Extend enum to include 'bounced' — MySQL only (SQLite doesn't enforce enums)
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE email_logs MODIFY COLUMN status ENUM('sent', 'failed', 'bounced') DEFAULT 'sent'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE email_logs MODIFY COLUMN status ENUM('sent', 'failed') DEFAULT 'sent'");
        }

        Schema::table('email_logs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sent_by');
            $table->dropColumn('bounced_at');
        });
    }
};
