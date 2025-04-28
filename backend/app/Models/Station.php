<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Station extends Model
{
    protected $fillable = ['name', 'x', 'y', 'location'];

    protected $casts = [
        'location' => 'array',
    ];
    

    public function lines()
    {
        return $this->belongsToMany(Line::class, 'station_line');
    }
    
}
