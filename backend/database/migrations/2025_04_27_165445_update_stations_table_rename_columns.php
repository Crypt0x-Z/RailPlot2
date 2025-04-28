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
        Schema::table('stations', function (Blueprint $table) {
            $table->renameColumn('station_name', 'name');
            $table->renameColumn('x_coord', 'x');
            $table->renameColumn('y_coord', 'y');
            $table->json('location')->change();
        });
    }
    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stations', function (Blueprint $table) {
            $table->renameColumn('name', 'station_name');
            $table->renameColumn('x', 'x_coord');
            $table->renameColumn('y', 'y_coord');
            $table->string('location', 255)->change();
        });
    }
    
};
