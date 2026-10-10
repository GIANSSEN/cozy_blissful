<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Groups sibling appointments created in one multi-service checkout.
            // NULL means a legacy single-service booking with no group.
            $table->uuid('booking_group_id')->nullable()->after('notes')->index('appointments_booking_group_idx');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex('appointments_booking_group_idx');
            $table->dropColumn('booking_group_id');
        });
    }
};
