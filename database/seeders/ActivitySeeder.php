<?php

namespace Database\Seeders;

use App\Models\Activity;
use Illuminate\Database\Seeder;

class ActivitySeeder extends Seeder
{
    /**
     * Seed sample activities for each NSTP component.
     */
    public function run(): void
    {
        $activities = [
            // CWTS Activities
            [
                'title'         => 'Community Clean-Up Drive',
                'component'     => 'CWTS',
                'activity_date' => '2025-06-28',
                'activity_time' => '07:00',
                'location'      => 'Barangay Poblacion, Davao del Norte',
                'description'   => 'A community clean-up drive to promote environmental awareness and community involvement among CWTS students.',
            ],
            [
                'title'         => 'Tree Planting Activity',
                'component'     => 'CWTS',
                'activity_date' => '2025-07-15',
                'activity_time' => '08:00',
                'location'      => 'City Forest Park, Tagum City',
                'description'   => 'Tree planting activity in coordination with the City Environment and Natural Resources Office.',
            ],
            [
                'title'         => 'Feeding Program for Indigent Children',
                'component'     => 'CWTS',
                'activity_date' => '2025-08-10',
                'activity_time' => '09:00',
                'location'      => 'Barangay Day Care Center, Davao del Norte',
                'description'   => 'Feeding program targeting undernourished children in partner barangays.',
            ],
            // LTS Activities
            [
                'title'         => 'Livelihood Skills Training — Basic Soap Making',
                'component'     => 'LTS',
                'activity_date' => '2025-07-05',
                'activity_time' => '08:00',
                'location'      => 'DNSC Livelihood Center',
                'description'   => 'Hands-on training on basic soap making skills for community beneficiaries.',
            ],
            [
                'title'         => 'Disaster Risk Reduction Training',
                'component'     => 'LTS',
                'activity_date' => '2025-07-20',
                'activity_time' => '08:00',
                'location'      => 'DNSC Gymnasium',
                'description'   => 'Training on disaster preparedness and risk reduction management.',
            ],
            // ROTC Activities
            [
                'title'         => 'Physical Fitness Test',
                'component'     => 'ROTC',
                'activity_date' => '2025-06-20',
                'activity_time' => '06:00',
                'location'      => 'DNSC Parade Ground',
                'description'   => 'Annual physical fitness test for all ROTC cadets.',
            ],
            [
                'title'         => 'First Aid and Basic Life Support Training',
                'component'     => 'ROTC',
                'activity_date' => '2025-07-12',
                'activity_time' => '08:00',
                'location'      => 'DNSC Covered Court',
                'description'   => 'First aid and basic life support training conducted by the Philippine Red Cross.',
            ],
        ];

        foreach ($activities as $a) {
            Activity::updateOrCreate(
                ['title' => $a['title'], 'component' => $a['component']],
                array_merge($a, ['created_at' => now()])
            );
        }
    }
}
