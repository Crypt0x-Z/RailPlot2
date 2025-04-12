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
        Schema::create('lines', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId("start_station_id")->references("id")->on("stations")->onDelete("cascade");
            $table->foreignId("end_station_id")->references("id")->on("stations")->onDelete("cascade");
            $table->integer('length');
            $table->string("demand");
            $table->string("type");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lines');
    }
};
