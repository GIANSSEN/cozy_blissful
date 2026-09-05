<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            if (!Schema::hasColumn('appointments', 'payment_status')) {
                $table->string('payment_status')->default('unpaid')->after('status');
            }
            if (!Schema::hasColumn('appointments', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('payment_status');
            }
            if (!Schema::hasColumn('appointments', 'paymongo_session_id')) {
                $table->string('paymongo_session_id')->nullable()->after('payment_method');
            }
            if (!Schema::hasColumn('appointments', 'paymongo_payment_id')) {
                $table->string('paymongo_payment_id')->nullable()->after('paymongo_session_id');
            }
            if (!Schema::hasColumn('appointments', 'amount_paid')) {
                $table->decimal('amount_paid', 10, 2)->nullable()->after('paymongo_payment_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn([
                'payment_status',
                'payment_method',
                'paymongo_session_id',
                'paymongo_payment_id',
                'amount_paid',
            ]);
        });
    }
};
