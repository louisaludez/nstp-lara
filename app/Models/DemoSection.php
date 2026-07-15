<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DemoSection extends Model
{
    protected $table = 'demo_sections';

    protected $fillable = [
        'student_no',
        'student_name',
        'program',
        'instructor_id',
    ];

    /** The instructor assigned to this demo section. */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(PortalUser::class, 'instructor_id');
    }
}
