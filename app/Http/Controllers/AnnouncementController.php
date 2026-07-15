<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * GET /api/announcements
     * Returns announcements, pinned first, optionally filtered by target_role.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Announcement::query()
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at');

        if ($role = $request->query('role')) {
            $query->where(function ($q) use ($role) {
                $q->where('target_role', 'All')
                  ->orWhere('target_role', $role);
            });
        }

        $announcements = $query->get()->map(fn(Announcement $a) => [
            'id'          => $a->id,
            'title'       => $a->title,
            'content'     => $a->content,
            'source'      => $a->source,
            'is_pinned'   => $a->is_pinned,
            'target_role' => $a->target_role,
            'created_at'  => $a->created_at?->toDateTimeString(),
            'time_ago'    => $a->created_at?->diffForHumans() ?? '',
        ]);

        return response()->json($announcements);
    }

    /**
     * POST /api/announcements
     * Create a new announcement (coordinator only).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'content'     => 'required|string',
            'source'      => 'nullable|string|max:100',
            'is_pinned'   => 'nullable|boolean',
            'target_role' => 'nullable|string|max:50',
        ]);

        $announcement = Announcement::create(array_merge($data, [
            'source'      => $data['source'] ?? 'NSTP Office',
            'is_pinned'   => $data['is_pinned'] ?? false,
            'target_role' => $data['target_role'] ?? 'All',
            'created_at'  => now(),
        ]));

        return response()->json(['success' => true, 'announcement' => $announcement], 201);
    }

    /**
     * PATCH /api/announcements/{id}
     * Update an announcement.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $announcement = Announcement::findOrFail($id);

        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'content'     => 'sometimes|string',
            'source'      => 'nullable|string|max:100',
            'is_pinned'   => 'nullable|boolean',
            'target_role' => 'nullable|string|max:50',
        ]);

        $announcement->update($data);

        return response()->json(['success' => true, 'announcement' => $announcement]);
    }

    /**
     * DELETE /api/announcements/{id}
     * Remove an announcement.
     */
    public function destroy(int $id): JsonResponse
    {
        Announcement::findOrFail($id)->delete();

        return response()->json(['success' => true]);
    }
}
