<?php

namespace Database\Factories;

use App\Models\PortalUser;
use App\Models\Section;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Section>
 */
class SectionFactory extends Factory
{
    protected $model = Section::class;

    public function definition(): array
    {
        $component = fake()->randomElement(['CWTS', 'LTS', 'ROTC']);
        $letter    = fake()->randomLetter();
        $num       = fake()->numberBetween(1, 5);

        return [
            'section_name'  => strtoupper("{$component}-{$num}{$letter}"),
            'component'     => $component,
            'school_year'   => '2025-2026',
            'semester'      => fake()->randomElement(['1st', '2nd', 'Summer']),
            'instructor_id' => null,
        ];
    }

    /** Attach a specific component. */
    public function cwts(): static
    {
        return $this->state(fn() => ['component' => 'CWTS']);
    }

    public function lts(): static
    {
        return $this->state(fn() => ['component' => 'LTS']);
    }

    public function rotc(): static
    {
        return $this->state(fn() => ['component' => 'ROTC']);
    }
}
