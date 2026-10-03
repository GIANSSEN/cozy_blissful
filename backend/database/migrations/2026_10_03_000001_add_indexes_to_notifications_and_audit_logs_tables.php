<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->index('is_read', 'notifications_is_read_idx');
            $table->index('created_at', 'notifications_created_at_idx');
            $table->index(['is_read', 'created_at'], 'notifications_is_read_created_at_idx');
            $table->index('type', 'notifications_type_idx');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index('created_at', 'audit_logs_created_at_idx');
            $table->index('action', 'audit_logs_action_idx');
            $table->index('actor_role', 'audit_logs_actor_role_idx');
            $table->index('module', 'audit_logs_module_idx');
            $table->index('severity', 'audit_logs_severity_idx');
            $table->index(['action', 'created_at'], 'audit_logs_action_created_at_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notifications_is_read_idx');
            $table->dropIndex('notifications_created_at_idx');
            $table->dropIndex('notifications_is_read_created_at_idx');
            $table->dropIndex('notifications_type_idx');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('audit_logs_created_at_idx');
            $table->dropIndex('audit_logs_action_idx');
            $table->dropIndex('audit_logs_actor_role_idx');
            $table->dropIndex('audit_logs_module_idx');
            $table->dropIndex('audit_logs_severity_idx');
            $table->dropIndex('audit_logs_action_created_at_idx');
        });
    }
};
