<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('actor')->default('System');
            $table->string('actor_role')->default('admin');
            $table->enum('action', ['create', 'update', 'delete', 'login', 'config', 'access'])->default('create');
            $table->string('entity');
            $table->string('module')->nullable();
            $table->text('detail');
            $table->string('ip_address', 45)->nullable();
            $table->string('session_id')->nullable();
            $table->enum('severity', ['info', 'warning', 'danger'])->default('info');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
