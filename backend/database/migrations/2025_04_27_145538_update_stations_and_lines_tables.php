<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Update stations table
        Schema::table('stations', function (Blueprint $table) {
            $table->dropColumn('type'); // Remove old type
            $table->json('location')->nullable(); // Add new location (JSON)
        });

        // Update lines table
        Schema::table('lines', function (Blueprint $table) {
            $table->dropForeign(['start_station_id']);
            $table->dropForeign(['end_station_id']);
            $table->dropColumn('start_station_id');
            $table->dropColumn('end_station_id');
            $table->dropColumn('length');
            $table->dropColumn('demand');
            $table->dropColumn('type');

            $table->string('name');
            $table->string('code', 10);
            $table->string('color')->default('#000000');
            $table->string('type');
        });

        // Optional: update station_line pivot if needed
        // (no changes needed unless your logic changes)
    }

    public function down(): void
    {
        // Rollback logic if needed
        Schema::table('stations', function (Blueprint $table) {
            $table->dropColumn('location');
            $table->string('type')->default('ground');
        });

        Schema::table('lines', function (Blueprint $table) {
            $table->dropColumn(['name', 'code', 'color', 'type']);

            $table->foreignId('start_station_id')->constrained('stations')->onDelete('cascade');
            $table->foreignId('end_station_id')->constrained('stations')->onDelete('cascade');
            $table->integer('length')->default(0);
            $table->string('demand')->default('low');
            $table->string('type')->default('ground');
        });
    }
};
