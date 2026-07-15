<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Support\DashboardMetricsVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Student::portalQuery()->orderBy('sections.section_name')->orderBy('students.last_name');

        if ($section = $request->query('section')) {
            $query->where('sections.section_name', $section);
        }

        if ($grade = $request->query('grade')) {
            $query->where('students.grade', $grade);
        }

        $rows = $query->get()->map(function ($row) {
            $student = new Student;
            $student->forceFill($row->getAttributes());
            $student->section_code = $row->section_code ?? '';
            $student->school_year = $row->school_year ?? null;
            $student->enrollment_grade_status = $row->enrollment_grade_status ?? null;

            return $student->toPortalArray();
        });

        return response()->json($rows);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $nameParts = Student::parseName($data['name']);

        $student = Student::create([
            'student_id'         => $data['student_no'],
            'first_name'         => $nameParts['first_name'],
            'last_name'          => $nameParts['last_name'],
            'course'             => $data['program'] ?? null,
            'component'          => $this->componentFromSection($data['section_code'] ?? ''),
            'enrollment_status'  => 'Active',
            'grade'              => $data['grade'] ?? null,
            'date_of_birth'      => $data['dob'] ?: null,
            'place_of_birth'     => $data['birth_place'] ?? null,
            'sex'                => $data['gender'] ?: null,
            'contact_number'     => $data['cell_no'] ?? null,
            'email'              => $data['email'] ?? null,
            'complete_address'   => $data['address'] ?? null,
            'created_at'         => now(),
        ]);

        Student::syncEnrollment($student->student_id, $data['section_code'] ?? null, $data['grade'] ?? null);

        DashboardMetricsVersion::bump();

        $fresh = Student::portalQuery()->where('students.student_id', $student->student_id)->first();

        $student = new Student;
        $student->forceFill($fresh->getAttributes());
        $student->section_code = $fresh->section_code ?? '';
        $student->school_year = $fresh->school_year ?? null;
        $student->enrollment_grade_status = $fresh->enrollment_grade_status ?? null;

        return response()->json([
            'success' => true,
            'student' => $student->toPortalArray(),
        ], 201);
    }

    public function update(Request $request, string $student): JsonResponse
    {
        $record = Student::findOrFail($student);
        $data   = $this->validated($request, partial: true);

        $updates = [];
        if (isset($data['student_no'])) {
            $updates['student_id'] = $data['student_no'];
        }
        if (isset($data['name'])) {
            $parts = Student::parseName($data['name']);
            $updates['first_name'] = $parts['first_name'];
            $updates['last_name']  = $parts['last_name'];
        }
        if (array_key_exists('program', $data)) {
            $updates['course'] = $data['program'];
        }
        if (array_key_exists('grade', $data)) {
            $updates['grade'] = $data['grade'];
        }
        if (array_key_exists('dob', $data)) {
            $updates['date_of_birth'] = $data['dob'] ?: null;
        }
        if (array_key_exists('birth_place', $data)) {
            $updates['place_of_birth'] = $data['birth_place'];
        }
        if (array_key_exists('gender', $data)) {
            $updates['sex'] = $data['gender'] ?: null;
        }
        if (array_key_exists('cell_no', $data)) {
            $updates['contact_number'] = $data['cell_no'];
        }
        if (array_key_exists('email', $data)) {
            $updates['email'] = $data['email'];
        }
        if (array_key_exists('address', $data)) {
            $updates['complete_address'] = $data['address'];
        }

        $record->update($updates);

        if (isset($data['section_code']) || array_key_exists('grade', $data)) {
            Student::syncEnrollment(
                $record->student_id,
                $data['section_code'] ?? null,
                $data['grade'] ?? $record->grade
            );
        }

        DashboardMetricsVersion::bump();

        $fresh = Student::portalQuery()->where('students.student_id', $record->student_id)->first();

        $student = new Student;
        $student->forceFill($fresh->getAttributes());
        $student->section_code = $fresh->section_code ?? '';
        $student->school_year = $fresh->school_year ?? null;
        $student->enrollment_grade_status = $fresh->enrollment_grade_status ?? null;

        return response()->json([
            'success' => true,
            'student' => $student->toPortalArray(),
        ]);
    }

    public function destroy(string $student): JsonResponse
    {
        $record = Student::findOrFail($student);
        $record->delete();

        DashboardMetricsVersion::bump();

        return response()->json(['success' => true]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, bool $partial = false): array
    {
        return $request->validate([
            'student_no'   => [$partial ? 'sometimes' : 'required', 'string', 'max:64'],
            'name'         => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'section_code' => ['nullable', 'string', 'max:64'],
            'program'      => ['nullable', 'string', 'max:64'],
            'gender'       => ['nullable', 'string', 'max:16'],
            'dob'          => ['nullable', 'string', 'max:64'],
            'birth_place'  => ['nullable', 'string', 'max:255'],
            'address'      => ['nullable', 'string', 'max:500'],
            'cell_no'      => ['nullable', 'string', 'max:32'],
            'email'        => ['nullable', 'email', 'max:255'],
            'instructor'   => ['nullable', 'string', 'max:255'],
            'school_year'  => ['nullable', 'string', 'max:32'],
            'room'         => ['nullable', 'string', 'max:64'],
        ]);
    }

    public function import(Request $request): JsonResponse
    {

        $validator = \Validator::make($request->all(), [
            'file' => 'required|file|max:25600',
        ]);

        if ($validator->fails()) {
            \Log::warning('Master list import validation failed', [
                'errors' => $validator->errors()->toArray(),
                'input'  => array_keys($request->all()),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed for the uploaded file.',
                'errors'  => $validator->errors()->toArray(),
                'input_keys' => array_keys($request->all())
            ], 422);
        }

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, ['xlsx', 'xls', 'csv'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid file format. Only XLSX, XLS, and CSV files are accepted. Detected extension: .' . $extension
            ], 422);
        }
        try {
            $spreadsheet = IOFactory::load($file->getRealPath());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            // Locate header row dynamically
            $headerRowIndex = -1;
            $knownHeaders = [
                'last name', 'first name', 'lastname', 'firstname', 'last', 'first',
                'email address', 'email', 'student name', 'student_name', 'name', 'full name', 'fullname',
                'student no', 'student number', 'student_no', 'student_number', 'id'
            ];

            foreach ($rows as $idx => $row) {
                foreach ($row as $cellVal) {
                    if ($cellVal && is_string($cellVal)) {
                        $cleanVal = trim(strtolower($cellVal));
                        if (in_array($cleanVal, $knownHeaders)) {
                            $headerRowIndex = $idx;
                            break 2;
                        }
                    }
                }
            }

            if ($headerRowIndex !== -1) {
                // Slice headers
                $headerRow = $rows[$headerRowIndex];
                // Slice data rows after header
                $rows = array_slice($rows, $headerRowIndex + 1);
            } else {
                $headerRow = array_shift($rows);
            }

            // Lowercase and trim headers for search mapping
            $headerKeys = array_map(function ($h) {
                return trim(strtolower((string)$h));
            }, $headerRow);

            $getVal = function ($row, $keys) use ($headerKeys) {
                foreach ($keys as $k) {
                    $idx = array_search(strtolower($k), $headerKeys);
                    if ($idx !== false && isset($row[$idx]) && $row[$idx] !== '') {
                        return trim((string)$row[$idx]);
                    }
                }
                return '';
            };

            $importedSections = 0;
            $importedStudents = 0;
            $errors = [];

            // Program defaults based on filename / sheet name
            $sheetName = $worksheet->getTitle();
            $filenameToCheck = strtoupper($file->getClientOriginalName() . ' ' . $sheetName);
            $defaultNstpProg = 'CWTS';
            if (str_contains($filenameToCheck, 'ROTC')) {
                $defaultNstpProg = 'ROTC';
            } elseif (str_contains($filenameToCheck, 'LTS')) {
                $defaultNstpProg = 'LTS';
            }

            DB::beginTransaction();

            foreach ($rows as $rowIndex => $row) {
                // Skip empty rows
                if (empty(array_filter($row))) {
                    continue;
                }

                $studentNo = $getVal($row, ['student no', 'student number', 'id', 'student_no', 'student_number']);
                $fullName = $getVal($row, ['student name', 'student_name', 'name', 'full name', 'fullname']);

                // Parse last/first name from full name if present
                if (!$fullName) {
                    $lastName = $getVal($row, ['last name', 'lastname', 'last']);
                    $firstName = $getVal($row, ['first name', 'firstname', 'first']);
                    $middleName = $getVal($row, ['middle name', 'middlename', 'middle']);
                    if ($lastName || $firstName) {
                        $mi = $middleName ? ' ' . substr(trim($middleName), 0, 1) . '.' : '';
                        $fullName = trim($lastName . ', ' . $firstName . $mi);
                    }
                }

                if (!$fullName) {
                    continue; // Skip rows without name
                }

                if (!$studentNo) {
                    $studentNo = '2024-' . rand(10000, 99999);
                }

                $collegeProgram = $getVal($row, ['program', 'course', 'college program', 'college_program']);
                $sectionCode = $getVal($row, ['section code', 'section', 'class']);
                $dob = $getVal($row, ['date of birth', 'dob', 'birthday', 'birth date', 'birth_date']);
                $birthPlace = $getVal($row, ['place of birth', 'pob', 'birthplace', 'place_of_birth']);
                $gender = $getVal($row, ['gender', 'sex']) ?: 'Female';
                $address = $getVal($row, ['residential address', 'address', 'residential_address']);
                $cellNo = $getVal($row, ['cell #', 'cell number', 'phone', 'cell_no', 'contact']);
                $email = $getVal($row, ['email address', 'email', 'gmail', 'email_address']);
                $schoolYear = $getVal($row, ['school year', 'year', 'school_year']) ?: '2025-2026';

                // Determine component
                $nstpProg = $defaultNstpProg;
                if ($sectionCode) {
                    $sc = strtoupper($sectionCode);
                    if (str_contains($sc, 'ROTC')) {
                        $nstpProg = 'ROTC';
                    } elseif (str_contains($sc, 'LTS')) {
                        $nstpProg = 'LTS';
                    } elseif (str_contains($sc, 'CWTS')) {
                        $nstpProg = 'CWTS';
                    }
                } elseif ($collegeProgram) {
                    $cp = strtoupper($collegeProgram);
                    if (str_contains($cp, 'ROTC')) {
                        $nstpProg = 'ROTC';
                    } elseif (str_contains($cp, 'LTS')) {
                        $nstpProg = 'LTS';
                    }
                }

                // Split name
                $parsed = Student::parseName($fullName);

                // Format DOB
                $formattedDob = null;
                if ($dob) {
                    $time = strtotime($dob);
                    if ($time) {
                        $formattedDob = date('Y-m-d', $time);
                    }
                }

                // Create or Update Student
                $student = Student::where('student_id', $studentNo)->first();
                $studentData = [
                    'first_name' => $parsed['first_name'],
                    'last_name' => $parsed['last_name'],
                    'course' => $collegeProgram ?: null,
                    'component' => $nstpProg,
                    'enrollment_status' => 'Active',
                    'date_of_birth' => $formattedDob,
                    'place_of_birth' => $birthPlace ?: null,
                    'sex' => $gender,
                    'contact_number' => $cellNo ?: null,
                    'email' => $email ?: null,
                    'complete_address' => $address ?: null,
                ];

                if ($student) {
                    $student->update($studentData);
                } else {
                    $studentData['student_id'] = $studentNo;
                    $student = Student::create($studentData);
                }

                $importedStudents++;
            }

            DB::commit();
            DashboardMetricsVersion::bump();

            return response()->json([
                'success' => true,
                'message' => "Successfully imported students.",
                'imported_students' => $importedStudents,
                'imported_sections' => $importedSections
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Student Master List Import Failed', [
                'error' => $e->getMessage(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to parse Excel file: ' . $e->getMessage(),
                'debug' => [
                    'message' => $e->getMessage(),
                    'file'    => $e->getFile(),
                    'line'    => $e->getLine()
                ]
            ], 500);
        }
    }

    private function componentFromSection(string $sectionCode): string
    {
        $upper = strtoupper($sectionCode);
        if (str_contains($upper, 'ROTC')) {
            return 'ROTC';
        }
        if (str_contains($upper, 'LTS')) {
            return 'LTS';
        }

        return 'CWTS';
    }
}
