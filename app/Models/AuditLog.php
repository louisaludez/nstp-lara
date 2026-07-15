<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $table = 'portal_audit_logs';

    protected $fillable = [
        'username',
        'user_email',
        'role',
        'action',
        'action_type',
        'module',
        'target',
        'details',
        'performed_at',
    ];

    protected $casts = [
        'performed_at' => 'datetime',
    ];

    /**
     * Convenience factory: create a log entry in one call.
     *
     * @param  string       $action      e.g. "Deleted"
     * @param  string       $module      e.g. "Students"
     * @param  string|null  $target      e.g. "Juan dela Cruz (CWTS-1A)"
     * @param  string|null  $details     e.g. "Removed from section; moved to archive."
     * @param  string       $actionType  edit | system | approval | submission | alert
     * @param  array        $user        ['username', 'email', 'role']
     */
    public static function record(
        string $action,
        string $module,
        ?string $target    = null,
        ?string $details   = null,
        string $actionType = 'edit',
        array  $user       = []
    ): self {
        return self::create([
            'username'    => $user['username']  ?? null,
            'user_email'  => $user['email']     ?? null,
            'role'        => $user['role']       ?? null,
            'action'      => $action,
            'action_type' => $actionType,
            'module'      => $module,
            'target'      => $target,
            'details'     => $details,
            'performed_at' => now(),
        ]);
    }
}
