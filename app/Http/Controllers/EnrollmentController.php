<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    /**
     * GET /api/enrollments
     * Returns enrollments, optionally filtered by section_id or student_id.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Enrollment::with(['student', 'section']);

        if ($sectionId = $request->query('section_id')) {
            $query->where('section_id', $sectionId);
        }

        if ($studentId = $request->query('student_id')) {
            $query->where('student_id', $studentId);
        }

        $enrollments = $query->get()->map(fn(Enrollment $e) => [
            'id'            => $e->id,
            'student_id'    => $e->student_id,
            'student_name'  => $e->student
                ? trim($e->student->last_name . ', ' . $e->student->first_name, ', ')
                : $e->student_id,
            'section_id'    => $e->section_id,
            'section_name'  => $e->section?->section_name ?? '',
            'final_grade'   => $e->final_grade,
            'status'        => $e->status,
            'serial_number' => $e->serial_number,
            'created_at'    => $e->created_at?->toDateTimeString(),
        ]);

        return response()->json($enrollments);
    }

    /**
     * POST /api/enrollments
     * Enroll a student into a section.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id'    => 'required|string|exists:students,student_id',
            'section_id'    => 'required|integer|exists:sections,id',
            'final_grade'   => 'nullable|numeric|min:0|max:100',
            'status'        => 'nullable|in:Pending,Passed,Failed,Dropped',
            'serial_number' => 'nullable|string|max:100|unique:enrollments,serial_number',
        ]);

        $enrollment = Enrollment::create([
            'student_id'    => $data['student_id'],
            'section_id'    => $data['section_id'],
            'final_grade'   => $data['final_grade'] ?? null,
            'status'        => $data['status'] ?? 'Pending',
            'serial_number' => $data['serial_number'] ?? null,
            'created_at'    => now(),
        ]);

        return response()->json([
            'success'    => true,
            'enrollment' => $enrollment,
        ], 201);
    }

    /**
     * PATCH /api/enrollments/{id}
     * Update enrollment grade/status.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $enrollment = Enrollment::findOrFail($id);

        $data = $request->validate([
            'final_grade'   => 'nullable|numeric|min:0|max:100',
            'status'        => 'nullable|in:Pending,Passed,Failed,Dropped',
            'serial_number' => 'nullable|string|max:100|unique:enrollments,serial_number,' . $id,
        ]);

        $enrollment->update(array_filter($data, fn($v) => !is_null($v)));

        return response()->json(['success' => true, 'enrollment' => $enrollment]);
    }

    /**
     * DELETE /api/enrollments/{id}
     * Remove an enrollment record.
     */
    public function destroy(int $id): JsonResponse
    {
        Enrollment::findOrFail($id)->delete();

        return response()->json(['success' => true]);
    }
}
