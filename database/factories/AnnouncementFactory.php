<?php

namespace Database\Factories;

use App\Models\Announcement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Announcement>
 */
class AnnouncementFactory extends Factory
{
    protected $model = Announcement::class;

    public function definition(): array
    {
        return [
            'title'       => fake()->sentence(6),
            'content'     => fake()->paragraphs(2, true),
            'source'      => fake()->randomElement(['NSTP Office', 'Registrar', 'Dean\'s Office', 'Student Affairs']),
            'is_pinned'   => false,
            'target_role' => fake()->randomElement(['All', 'instructor', 'coordinator', 'rotc']),
            'created_at'  => fake()->dateTimeBetween('-2 months', 'now'),
        ];
    }

    /** Create a pinned announcement. */
    public function pinned(): static
    {
        return $this->state(fn() => ['is_pinned' => true]);
    }

    /** Target all roles. */
    public function forAll(): static
    {
        return $this->state(fn() => ['target_role' => 'All']);
    }
}
