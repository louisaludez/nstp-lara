<?php

namespace Database\Factories;

use App\Models\Enrollment;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Enrollment>
 */
class EnrollmentFactory extends Factory
{
    protected $model = Enrollment::class;

    public function definition(): array
    {
        return [
            'student_id'    => Student::factory(),
            'section_id'    => Section::factory(),
            'final_grade'   => null,
            'status'        => 'Pending',
            'serial_number' => null,
        ];
    }

    /** Mark enrollment as passed. */
    public function passed(): static
    {
        return $this->state(fn() => [
            'final_grade' => fake()->randomFloat(2, 75, 100),
            'status'      => 'Passed',
        ]);
    }

    /** Mark enrollment as failed. */
    public function failed(): static
    {
        return $this->state(fn() => [
            'final_grade' => fake()->randomFloat(2, 50, 74),
            'status'      => 'Failed',
        ]);
    }
}
