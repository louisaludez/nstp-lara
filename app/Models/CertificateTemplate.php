<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CertificateTemplate extends Model
{
    use SoftDeletes;

    protected $table = 'certificate_templates';

    protected $fillable = [
        'name',
        'component',
        'bg_theme',
        'bg_image',
        'title_text',
        'body_text',
        'signatory_name',
        'signatory_title',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    /**
     * Render the template body text dynamically replacing placeholders.
     */
    public function renderBody(string $studentName, string $sectionName, string $schoolYear, string $date = null): string
    {
        $dateStr = $date ?: now()->format('F d, Y');
        
        $placeholders = [
            '[STUDENT_NAME]' => $studentName,
            '[SECTION]'      => $sectionName,
            '[SCHOOL_YEAR]'  => $schoolYear,
            '[DATE]'         => $dateStr,
        ];

        return str_replace(array_keys($placeholders), array_values($placeholders), $this->body_text);
    }
}
