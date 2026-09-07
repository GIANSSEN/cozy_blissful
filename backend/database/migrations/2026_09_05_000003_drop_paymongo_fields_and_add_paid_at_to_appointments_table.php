<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $dropColumns = [];
            if (Schema::hasColumn('appointments', 'paymongo_session_id')) {
                $dropColumns[] = 'paymongo_session_id';
            }
            if (Schema::hasColumn('appointments', 'paymongo_payment_id')) {
                $dropColumns[] = 'paymongo_payment_id';
            }
            if (!empty($dropColumns)) {
                $table->dropColumn($dropColumns);
            }

            if (!Schema::hasColumn('appointments', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('amount_paid');
            }
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            if (!Schema::hasColumn('appointments', 'paymongo_session_id')) {
                $table->string('paymongo_session_id')->nullable()->after('payment_method');
            }
            if (!Schema::hasColumn('appointments', 'paymongo_payment_id')) {
                $table->string('paymongo_payment_id')->nullable()->after('paymongo_session_id');
            }
            if (Schema::hasColumn('appointments', 'paid_at')) {
                $table->dropColumn('paid_at');
            }
        });
    }
};
