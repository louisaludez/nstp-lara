<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityPlan extends Model
{
    protected $table = 'activity_plans';

    public $timestamps = true;

    protected $fillable = [
        'instructor_id',
        'section_id',
        'title',
        'description',
        'location',
        'scheduled_date',
        'objectives',
        'files_attached',
        'status',
        'submitted_date',
        'feedback',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'submitted_date' => 'datetime',
        'files_attached' => 'integer',
    ];

    /** The instructor who submitted this plan. */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(PortalUser::class, 'instructor_id');
    }

    /** The section this plan is for. */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class, 'section_id');
    }
}
