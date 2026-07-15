<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    /**
     * GET /api/activities
     * Returns all activities, optionally filtered by component.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Activity::query()->orderByDesc('activity_date');

        if ($component = $request->query('component')) {
            $query->where('component', $component);
        }

        $activities = $query->get()->map(fn(Activity $a) => [
            'id'            => $a->id,
            'title'         => $a->title,
            'component'     => $a->component,
            'activity_date' => $a->activity_date?->format('Y-m-d'),
            'activity_time' => $a->activity_time,
            'location'      => $a->location,
            'description'   => $a->description,
            'created_at'    => $a->created_at?->toDateTimeString(),
        ]);

        return response()->json($activities);
    }

    /**
     * POST /api/activities
     * Create a new activity.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'         => 'required|string|max:255',
            'component'     => 'required|in:CWTS,LTS,ROTC',
            'activity_date' => 'required|date',
            'activity_time' => 'required|date_format:H:i',
            'location'      => 'required|string|max:255',
            'description'   => 'nullable|string',
        ]);

        $activity = Activity::create(array_merge($data, ['created_at' => now()]));

        return response()->json(['success' => true, 'activity' => $activity], 201);
    }

    /**
     * PATCH /api/activities/{id}
     * Update an activity.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $activity = Activity::findOrFail($id);

        $data = $request->validate([
            'title'         => 'sometimes|string|max:255',
            'component'     => 'sometimes|in:CWTS,LTS,ROTC',
            'activity_date' => 'sometimes|date',
            'activity_time' => 'sometimes|date_format:H:i',
            'location'      => 'sometimes|string|max:255',
            'description'   => 'nullable|string',
        ]);

        $activity->update($data);

        return response()->json(['success' => true, 'activity' => $activity]);
    }

    /**
     * DELETE /api/activities/{id}
     * Remove an activity.
     */
    public function destroy(int $id): JsonResponse
    {
        Activity::findOrFail($id)->delete();

        return response()->json(['success' => true]);
    }
}
