<?php

namespace App\Models;
use App\Models\Station;
use Illuminate\Database\Eloquent\Model;

class Line extends Model
{
    protected $fillable = ["start_station_id", "end_station_id", "length", "demand", "type"];

    public function stations(){
        return $this->belongsToMany(Station::class);
    }
}
