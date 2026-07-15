<?php

namespace Database\Factories;

use App\Models\PortalUser;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PortalUser>
 */
class PortalUserFactory extends Factory
{
    protected $model = PortalUser::class;

    public function definition(): array
    {
        return [
            'name'     => fake()->name(),
            'email'    => fake()->unique()->safeEmail(),
            'password' => '',
            'role'     => fake()->randomElement(['coordinator', 'instructor', 'rotc']),
            'dept'     => fake()->randomElement(['CWTS', 'LTS', 'ROTC', 'NSTP Office', 'IT Department']),
            'status'   => 'Active',
            'contact'  => fake()->optional()->phoneNumber(),
        ];
    }

    /** Create an instructor account. */
    public function instructor(): static
    {
        return $this->state(fn() => ['role' => 'instructor']);
    }

    /** Create a coordinator account. */
    public function coordinator(): static
    {
        return $this->state(fn() => ['role' => 'coordinator', 'dept' => 'NSTP Office']);
    }

    /** Create a ROTC officer account. */
    public function rotc(): static
    {
        return $this->state(fn() => ['role' => 'rotc', 'dept' => 'ROTC']);
    }
}
