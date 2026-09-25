<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Critical indexes for booking queries
            $table->index('datetime', 'appointments_datetime_idx');
            $table->index('status', 'appointments_status_idx');
            $table->index('client_id', 'appointments_client_id_idx');
            $table->index('therapist_id', 'appointments_therapist_id_idx');
            $table->index('service_id', 'appointments_service_id_idx');
            $table->index('payment_status', 'appointments_payment_status_idx');

            // Composite indexes for common query patterns
            $table->index(['datetime', 'status'], 'appointments_datetime_status_idx');
            $table->index(['client_id', 'datetime'], 'appointments_client_datetime_idx');
            $table->index(['therapist_id', 'datetime'], 'appointments_therapist_datetime_idx');
            $table->index(['therapist_id', 'status', 'datetime'], 'appointments_therapist_status_datetime_idx');
            $table->index(['status', 'datetime'], 'appointments_status_datetime_idx');
        });

        Schema::table('therapist_availabilities', function (Blueprint $table) {
            $table->index('date', 'therapist_availabilities_date_idx');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('status', 'users_status_idx');
            $table->index('tier', 'users_tier_idx');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->index('status', 'services_status_idx');
            $table->index('category', 'services_category_idx');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex('appointments_datetime_idx');
            $table->dropIndex('appointments_status_idx');
            $table->dropIndex('appointments_client_id_idx');
            $table->dropIndex('appointments_therapist_id_idx');
            $table->dropIndex('appointments_service_id_idx');
            $table->dropIndex('appointments_payment_status_idx');
            $table->dropIndex('appointments_datetime_status_idx');
            $table->dropIndex('appointments_client_datetime_idx');
            $table->dropIndex('appointments_therapist_datetime_idx');
            $table->dropIndex('appointments_therapist_status_datetime_idx');
            $table->dropIndex('appointments_status_datetime_idx');
        });

        Schema::table('therapist_availabilities', function (Blueprint $table) {
            $table->dropIndex('therapist_availabilities_date_idx');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_status_idx');
            $table->dropIndex('users_tier_idx');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropIndex('services_status_idx');
            $table->dropIndex('services_category_idx');
        });
    }
};