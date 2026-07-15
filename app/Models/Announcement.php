<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $table = 'announcements';

    public $timestamps = false;

    protected $fillable = [
        'title',
        'content',
        'source',
        'is_pinned',
        'target_role',
        'created_at',
    ];

    protected $casts = [
        'is_pinned'  => 'boolean',
        'created_at' => 'datetime',
    ];
}
