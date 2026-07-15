<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    protected $table = 'enrollments';
    public $timestamps = true;

    protected $fillable = [
        'student_id',
        'section_id',
        'final_grade',
        'status',
        'serial_number',
        'created_at',
    ];

    protected $casts = [
        'final_grade' => 'decimal:2',
        'created_at'  => 'datetime',
    ];

    /** The student enrolled. */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /** The section the student is enrolled in. */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class, 'section_id');
    }
}
