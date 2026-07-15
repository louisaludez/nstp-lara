<?php

namespace App\Http\Controllers;

use App\Models\PortalNotification;
use App\Models\PortalUser;
use App\Models\Section;
use App\Support\DashboardMetricsVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    /**
     * GET /api/sections
     * Returns all sections with instructor name and student count.
     */
    public function index(): JsonResponse
    {
        $sections = Section::with('instructor')->get();

        $rows = $sections->map(function (Section $s) {
            // Count students in this section via the enrollments bridge or the section_code column on students
            $studentCount = \DB::table('students')
                ->join('enrollments', 'students.student_id', '=', 'enrollments.student_id')
                ->join('sections as sec', 'sec.id', '=', 'enrollments.section_id')
                ->where('sec.id', $s->id)
                ->count();

            return [
                'id'           => $s->id,
                'code'         => $s->section_name,
                'program'      => $s->component,
                'schoolYear'   => $s->school_year,
                'semester'     => $s->semester,
                'room'         => $s->room,
                'schedule'     => $s->schedule,
                'status'       => $s->status,
                'instructor'   => $s->instructor_name,
                'instructor_id'=> $s->instructor_id,
                'students'     => $studentCount,
            ];
        });

        return response()->json($rows);
    }

    /**
     * POST /api/sections
     * Create a new section.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'            => 'required|string|max:64|unique:sections,section_name',
            'program'         => 'nullable|in:CWTS,LTS,ROTC',
            'school_year'     => 'nullable|string|max:32',
            'semester'        => 'nullable|string|max:64',
            'room'            => 'nullable|string|max:64',
            'schedule'        => 'nullable|string|max:128',
            'status'          => 'nullable|string|max:32',
            'instructor_name' => 'nullable|string|max:255',
            'upload_token'    => 'nullable|string',
            'students'        => 'nullable|array',
        ]);

        $instructor = null;
        if (!empty($data['instructor_name'])) {
            $instructor = PortalUser::where('name', $data['instructor_name'])
                ->where('role', 'instructor')
                ->first();
        }

        \DB::beginTransaction();

        try {
            $section = Section::create([
                'section_name'  => $data['code'],
                'component'     => $data['program'] ?? 'CWTS',
                'school_year'   => $data['school_year'] ?? '2025-2026',
                'semester'      => $data['semester'] ?? '1st Semester',
                'room'          => $data['room'] ?? 'TBA',
                'schedule'      => $data['schedule'] ?? null,
                'status'        => $data['status'] ?? 'Active',
                'instructor_id' => $instructor?->id,
            ]);

            $importedCount = 0;
            if (!empty($data['upload_token'])) {
                // Fetch the matched records from class_list_students
                $tempStudents = \DB::table('class_list_students')
                    ->where('section_name', $data['upload_token'])
                    ->get();

                foreach ($tempStudents as $ts) {
                    // Update section_name to the actual new section name
                    \DB::table('class_list_students')
                        ->where('id', $ts->id)
                        ->update([
                            'section_name' => $section->section_name,
                            'updated_at'   => now(),
                        ]);

                    // Sync enrollment for this student in the master database
                    $student = \App\Models\Student::where('student_id', $ts->student_id)->first();
                    if ($student) {
                        \App\Models\Student::syncEnrollment($student->student_id, $section->section_name, null);
                    }
                    $importedCount++;
                }
            } elseif (!empty($data['students'])) {
                foreach ($data['students'] as $s) {
                    $sName = $s['name'] ?? null;
                    if (!$sName) continue;
                    
                    $sNo = $s['studentNo'] ?? null;
                    if (!$sNo) continue;

                    // Match against master list student table
                    $student = \App\Models\Student::where('student_id', $sNo)->first();
                    if (!$student) {
                        // DO NOT STORE new students from class list XLSX if they aren't in masterlist!
                        continue;
                    }
                    
                    $parsed = \App\Models\Student::parseName($sName);
                    
                    $dobVal = null;
                    if (!empty($s['dob'])) {
                        $time = strtotime($s['dob']);
                        if ($time) {
                            $dobVal = date('Y-m-d', $time);
                        }
                    }

                    $studentData = [
                        'first_name' => $parsed['first_name'],
                        'last_name' => $parsed['last_name'],
                        'course' => $s['program'] ?? 'BSIT',
                        'component' => $section->component,
                        'enrollment_status' => 'Active',
                        'date_of_birth' => $dobVal,
                        'place_of_birth' => $s['birthPlace'] ?? null,
                        'sex' => $s['gender'] ?? 'Female',
                        'contact_number' => $s['cellNo'] ?? null,
                        'email' => $s['email'] ?? null,
                        'complete_address' => $s['address'] ?? null,
                    ];

                    $student->update($studentData);

                    \App\Models\Student::syncEnrollment($student->student_id, $section->section_name, null);

                    // Store student specifically in class_list_students table
                    \DB::table('class_list_students')->insert([
                        'section_name' => $section->section_name,
                        'student_id'   => $student->student_id,
                        'name'         => $sName,
                        'course'       => $s['program'] ?? null,
                        'gender'       => $s['gender'] ?? null,
                        'dob'          => $dobVal,
                        'place_of_birth'=> $s['birthPlace'] ?? null,
                        'address'      => $s['address'] ?? null,
                        'cell_no'      => $s['cellNo'] ?? null,
                        'email'        => $s['email'] ?? null,
                        'created_at'   => now(),
                        'updated_at'   => now(),
                    ]);

                    $importedCount++;
                }
            }

            // Fire assignment notification if instructor was provided
            if ($instructor) {
                PortalNotification::create([
                    'user_id' => $instructor->id,
                    'type'    => 'assignment',
                    'title'   => 'New Section Assigned',
                    'message' => "You have been assigned to handle section {$section->section_name}. Please check your My Classes page for details.",
                    'is_read' => false,
                ]);
            }

            \DB::commit();
            DashboardMetricsVersion::bump();

            return response()->json([
                'success' => true,
                'message' => "Section {$section->section_name} created successfully with {$importedCount} students.",
                'section' => [
                    'id'         => $section->id,
                    'code'       => $section->section_name,
                    'program'    => $section->component,
                    'schoolYear' => $section->school_year,
                    'room'       => $section->room,
                    'status'     => $section->status,
                    'instructor' => $section->instructor_name,
                    'students'   => $importedCount,
                ],
            ], 201);

        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create section: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * POST /api/sections/assign
     * Assign an instructor to a section. Creates a notification.
     */
    public function assign(Request $request): JsonResponse
    {
        $data = $request->validate([
            'section_code'    => 'required|string|exists:sections,section_name',
            'instructor_email'=> 'required|email|exists:portal_users,email',
        ]);

        $section    = Section::where('section_name', $data['section_code'])->firstOrFail();
        $instructor = PortalUser::where('email', $data['instructor_email'])
                                ->where('role', 'instructor')
                                ->firstOrFail();

        $section->instructor_id = $instructor->id;
        $section->save();

        // Create a notification for the instructor
        PortalNotification::create([
            'user_id' => $instructor->id,
            'type'    => 'assignment',
            'title'   => 'New Section Assigned',
            'message' => "You have been assigned to handle section {$section->section_name}. Please check your My Classes page for details.",
            'is_read' => false,
        ]);

        DashboardMetricsVersion::bump();

        return response()->json([
            'success'    => true,
            'section'    => $section->section_name,
            'instructor' => $instructor->name,
        ]);
    }

    /**
     * POST /api/sections/compare-class-list
     * Performs a database-driven comparison between uploaded class list students
     * and the database master students list using class_list_students.
     */
    public function compareClassList(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token'    => 'required|string',
            'students' => 'required|array',
        ]);

        $token = $data['token'];
        $studentsList = $data['students'];

        \DB::beginTransaction();

        try {
            // Delete any existing temp records for this token
            \DB::table('class_list_students')->where('section_name', $token)->delete();

            $matchedRows = [];

            // Fetch all db students once to avoid N+1 queries and handle multibyte matching perfectly in PHP
            $dbStudents = \App\Models\Student::all();

            // Helper function to normalize name strings case-insensitively and multibyte-safely
            $normalizeName = function ($name) {
                if (!$name) return '';
                $lower = mb_strtolower($name, 'UTF-8');
                // Strip all special chars, spaces, commas, and dots but retain alphanumeric characters and ñ
                return preg_replace('/[^a-z0-9ñ]/u', '', $lower);
            };

            // Query and compare against the XAMPP students table directly
            foreach ($studentsList as $s) {
                $sName = $s['name'] ?? null;
                if (!$sName) continue;

                $sNo = $s['studentNo'] ?? null;

                $dbStudent = null;

                // 1. Try matching by student ID first
                if ($sNo) {
                    $dbStudent = $dbStudents->firstWhere('student_id', $sNo);
                }

                // 2. Try matching by exact name format (Last, First Middle)
                if (!$dbStudent) {
                    $normUploaded = $normalizeName($sName);
                    
                    foreach ($dbStudents as $ds) {
                        $dsFullName = $ds->last_name . ', ' . $ds->first_name;
                        $normDb = $normalizeName($dsFullName);
                        
                        if ($normUploaded === $normDb) {
                            $dbStudent = $ds;
                            break;
                        }
                    }
                }

                // 3. Try matching by reverse name combination (First Last)
                if (!$dbStudent) {
                    $normUploaded = $normalizeName($sName);
                    
                    foreach ($dbStudents as $ds) {
                        $dsFullNameRev = $ds->first_name . ' ' . $ds->last_name;
                        $normDbRev = $normalizeName($dsFullNameRev);
                        
                        if ($normUploaded === $normDbRev) {
                            $dbStudent = $ds;
                            break;
                        }
                    }
                }

                // 4. Try matching by Last Name + First Name (ignoring middle initials)
                if (!$dbStudent) {
                    $parsed = \App\Models\Student::parseName($sName);
                    $normUploadedLastFirst = $normalizeName($parsed['last_name'] . $parsed['first_name']);
                    
                    foreach ($dbStudents as $ds) {
                        $normDbLastFirst = $normalizeName($ds->last_name . $ds->first_name);
                        
                        if ($normUploadedLastFirst && $normDbLastFirst && (
                            str_contains($normUploadedLastFirst, $normDbLastFirst) || 
                            str_contains($normDbLastFirst, $normUploadedLastFirst) ||
                            $normUploadedLastFirst === $normDbLastFirst
                        )) {
                            $dbStudent = $ds;
                            break;
                        }
                    }
                }

                if ($dbStudent) {
                    // Update master student if any demographic fields are empty in DB but provided in XLSX
                    $studentUpdates = [];
                    
                    if (empty($dbStudent->place_of_birth) && !empty($s['birthPlace'])) {
                        $studentUpdates['place_of_birth'] = $s['birthPlace'];
                        $dbStudent->place_of_birth = $s['birthPlace'];
                    }
                    
                    if (empty($dbStudent->date_of_birth) && !empty($s['dob'])) {
                        $time = strtotime($s['dob']);
                        if ($time) {
                            $formattedDob = date('Y-m-d', $time);
                            $studentUpdates['date_of_birth'] = $formattedDob;
                            $dbStudent->date_of_birth = $formattedDob;
                        }
                    }
                    
                    if (empty($dbStudent->sex) && !empty($s['gender'])) {
                        $studentUpdates['sex'] = $s['gender'];
                        $dbStudent->sex = $s['gender'];
                    }
                    
                    if (empty($dbStudent->contact_number) && !empty($s['cellNo'])) {
                        $studentUpdates['contact_number'] = $s['cellNo'];
                        $dbStudent->contact_number = $s['cellNo'];
                    }
                    
                    if (empty($dbStudent->complete_address) && !empty($s['address'])) {
                        $studentUpdates['complete_address'] = $s['address'];
                        $dbStudent->complete_address = $s['address'];
                    }
                    
                    if (!empty($studentUpdates)) {
                        $dbStudent->update($studentUpdates);
                    }

                    $dobVal = $dbStudent->date_of_birth ? ($dbStudent->date_of_birth instanceof \DateTimeInterface ? $dbStudent->date_of_birth->format('Y-m-d') : $dbStudent->date_of_birth) : null;
                    
                    \DB::table('class_list_students')->insert([
                        'section_name' => $token,
                        'student_id'   => $dbStudent->student_id,
                        'name'         => trim($dbStudent->last_name . ', ' . $dbStudent->first_name, ', '),
                        'course'       => $dbStudent->course ?? $s['program'] ?? null,
                        'gender'       => $dbStudent->sex ?? $s['gender'] ?? 'Female',
                        'dob'          => $dobVal,
                        'place_of_birth'=> $dbStudent->place_of_birth ?? $s['birthPlace'] ?? null,
                        'address'      => $dbStudent->complete_address ?? $s['address'] ?? null,
                        'cell_no'      => $dbStudent->contact_number ?? $s['cellNo'] ?? null,
                        'email'        => $dbStudent->email ?? $s['email'] ?? null,
                        'created_at'   => now(),
                        'updated_at'   => now(),
                    ]);

                    $matchedRows[] = [
                        'name'      => trim($dbStudent->last_name . ', ' . $dbStudent->first_name, ', '),
                        'studentNo' => $dbStudent->student_id,
                        'gender'    => $dbStudent->sex ?? 'Female',
                        'dob'       => $dobVal ?? '',
                        'birthPlace'=> $dbStudent->place_of_birth ?? '',
                        'address'   => $dbStudent->complete_address ?? '',
                        'cellNo'    => $dbStudent->contact_number ?? '',
                        'email'     => $dbStudent->email ?? '',
                        'program'   => $dbStudent->course ?? '',
                    ];
                }
            }

            \DB::commit();

            return response()->json([
                'success' => true,
                'matched' => $matchedRows
            ]);

        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to compare class list: ' . $e->getMessage()
            ], 500);
        }
    }
}
