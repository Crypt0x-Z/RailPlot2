<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Line extends Model
{
    protected $fillable = ['name', 'code', 'color', 'type'];

    public function stations()
    {
        return $this->belongsToMany(Station::class, 'station_line');
    }
    
}
