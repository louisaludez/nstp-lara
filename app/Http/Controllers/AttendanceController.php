<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * GET /api/attendance
     * Returns attendance records, filtered by section_id and/or date.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Attendance::with(['student', 'section']);

        if ($sectionId = $request->query('section_id')) {
            $query->where('section_id', $sectionId);
        }

        if ($date = $request->query('date')) {
            $query->whereDate('date', $date);
        }

        if ($studentId = $request->query('student_id')) {
            $query->where('student_id', $studentId);
        }

        $records = $query->orderByDesc('date')->get()->map(fn(Attendance $a) => [
            'id'           => $a->id,
            'student_id'   => $a->student_id,
            'student_name' => $a->student
                ? trim($a->student->last_name . ', ' . $a->student->first_name, ', ')
                : $a->student_id,
            'section_id'   => $a->section_id,
            'section_name' => $a->section?->section_name ?? '',
            'date'         => $a->date?->format('Y-m-d'),
            'status'       => $a->status,
        ]);

        return response()->json($records);
    }

    /**
     * POST /api/attendance
     * Record attendance for one student, or bulk for a section.
     *
     * Single:  { student_id, section_id, date, status }
     * Bulk:    { section_id, date, records: [{ student_id, status }] }
     */
    public function store(Request $request): JsonResponse
    {
        // Bulk mode
        if ($request->has('records')) {
            $data = $request->validate([
                'section_id'        => 'required|integer|exists:sections,id',
                'date'              => 'required|date',
                'records'           => 'required|array|min:1',
                'records.*.student_id' => 'required|string|exists:students,student_id',
                'records.*.status'     => 'required|in:Present,Absent,Late',
            ]);

            $inserted = 0;
            foreach ($data['records'] as $row) {
                Attendance::updateOrCreate(
                    [
                        'student_id' => $row['student_id'],
                        'section_id' => $data['section_id'],
                        'date'       => $data['date'],
                    ],
                    ['status' => $row['status']]
                );
                $inserted++;
            }

            return response()->json(['success' => true, 'count' => $inserted], 201);
        }

        // Single mode
        $data = $request->validate([
            'student_id' => 'required|string|exists:students,student_id',
            'section_id' => 'required|integer|exists:sections,id',
            'date'       => 'required|date',
            'status'     => 'required|in:Present,Absent,Late',
        ]);

        $record = Attendance::updateOrCreate(
            [
                'student_id' => $data['student_id'],
                'section_id' => $data['section_id'],
                'date'       => $data['date'],
            ],
            ['status' => $data['status']]
        );

        return response()->json(['success' => true, 'attendance' => $record], 201);
    }

    /**
     * DELETE /api/attendance/{id}
     * Remove a single attendance record.
     */
    public function destroy(int $id): JsonResponse
    {
        Attendance::findOrFail($id)->delete();

        return response()->json(['success' => true]);
    }
}
