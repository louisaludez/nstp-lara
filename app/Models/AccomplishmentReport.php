<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccomplishmentReport extends Model
{
    protected $table = 'accomplishment_reports';

    public $timestamps = true;

    protected $fillable = [
        'instructor_id',
        'section_id',
        'title',
        'location',
        'completed_date',
        'participants_count',
        'accomplishments',
        'report_file_path',
        'files_attached',
        'status',
        'submitted_date',
        'feedback',
    ];

    protected $casts = [
        'completed_date'    => 'date',
        'submitted_date'    => 'datetime',
        'participants_count'=> 'integer',
        'files_attached'    => 'integer',
    ];

    /** The instructor who submitted this report. */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(PortalUser::class, 'instructor_id');
    }

    /** The section this report is for. */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class, 'section_id');
    }
}
