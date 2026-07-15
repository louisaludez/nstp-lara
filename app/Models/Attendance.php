<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $table = 'attendance';

    public $timestamps = true;
    public $incrementing = true;

    protected $fillable = [
        'student_id',
        'section_id',
        'date',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    /** The student this attendance record belongs to. */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /** The section this attendance record belongs to. */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class, 'section_id');
    }
}
