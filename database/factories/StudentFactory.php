<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Student>
 */
class StudentFactory extends Factory
{
    protected $model = Student::class;

    /** Counter for unique student IDs. */
    private static int $counter = 1;

    public function definition(): array
    {
        $year = fake()->numberBetween(2020, 2025);
        $seq  = str_pad(self::$counter++, 5, '0', STR_PAD_LEFT);

        return [
            'student_id'        => "{$year}-{$seq}",
            'first_name'        => fake()->firstName(),
            'last_name'         => fake()->lastName(),
            'course'            => fake()->randomElement(['BSIT', 'BSCS', 'BSBA', 'BSN', 'BSED', 'BSSW']),
            'year_level'        => fake()->numberBetween(1, 4),
            'component'         => fake()->randomElement(['CWTS', 'LTS', 'ROTC']),
            'enrollment_status' => 'Active',
            'grade'             => null,
            'date_of_birth'     => fake()->dateTimeBetween('-25 years', '-17 years')->format('Y-m-d'),
            'sex'               => fake()->randomElement(['Male', 'Female']),
            'contact_number'    => fake()->optional()->phoneNumber(),
            'email'             => fake()->optional()->safeEmail(),
            'complete_address'  => fake()->optional()->address(),
        ];
    }

    /** Set student as passed. */
    public function passed(): static
    {
        return $this->state(fn() => ['grade' => 'pass', 'enrollment_status' => 'Completed']);
    }

    /** Set student as failed. */
    public function failed(): static
    {
        return $this->state(fn() => ['grade' => 'fail', 'enrollment_status' => 'Completed']);
    }
}
