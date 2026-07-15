<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;

class PortalUser extends Authenticatable
{
    use Notifiable;

    protected $table = 'portal_users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'dept',
        'status',
        'contact',
        'degree',
        'degree_title',
    ];

    protected $hidden = ['password'];

    /** Sections this instructor handles. */
    public function sections(): HasMany
    {
        return $this->hasMany(Section::class, 'instructor_id');
    }

    /** Notifications for this user. */
    public function notifications(): HasMany
    {
        return $this->hasMany(PortalNotification::class, 'user_id');
    }
}
