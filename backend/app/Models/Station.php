<?php

namespace App\Models;
use App\Models\Line;
use Illuminate\Database\Eloquent\Model;

class Station extends Model
{
    protected $fillable = ["station_name", "x_coord", "y_coord", "type"];

    public function lines(){
        return $this->belongsToMany(Line::class);
    }
}
