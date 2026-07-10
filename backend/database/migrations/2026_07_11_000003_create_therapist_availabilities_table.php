<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('therapist_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('therapist_id')->constrained('users')->onDelete('cascade');
            $table->date('date');
            $table->timestamps();

            $table->unique(['therapist_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('therapist_availabilities');
    }
};
