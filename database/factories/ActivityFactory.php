<?php

namespace Database\Factories;

use App\Models\Activity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Activity>
 */
class ActivityFactory extends Factory
{
    protected $model = Activity::class;

    private static array $titles = [
        'Community Clean-Up Drive',
        'Tree Planting Activity',
        'Livelihood Skills Training',
        'Health & Wellness Seminar',
        'Disaster Risk Reduction Training',
        'Feeding Program',
        'Environmental Awareness Campaign',
        'Leadership Training Workshop',
        'First Aid Training',
        'Coastal Clean-Up',
    ];

    public function definition(): array
    {
        return [
            'title'         => fake()->randomElement(self::$titles),
            'component'     => fake()->randomElement(['CWTS', 'LTS', 'ROTC']),
            'activity_date' => fake()->dateTimeBetween('now', '+3 months')->format('Y-m-d'),
            'activity_time' => fake()->randomElement(['07:00', '08:00', '09:00', '13:00', '14:00']),
            'location'      => fake()->city() . ' Barangay Hall',
            'description'   => fake()->sentences(3, true),
            'created_at'    => now(),
        ];
    }
}
