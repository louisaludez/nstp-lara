<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $table = 'activities';

    public $timestamps = false;

    protected $fillable = [
        'title',
        'component',
        'activity_date',
        'activity_time',
        'location',
        'description',
        'created_at',
    ];

    protected $casts = [
        'activity_date' => 'date',
        'created_at'    => 'datetime',
    ];
}
