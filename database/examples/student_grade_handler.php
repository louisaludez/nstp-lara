<?php
/**
 * Example: insert and fetch students with pass/fail grade (PDO + XAMPP).
 * Run from CLI: php database/examples/student_grade_handler.php
 */

$pdo = require __DIR__ . '/../connect.php';

// Insert
$insert = $pdo->prepare(
    'INSERT INTO students (student_no, name, section_code, program, grade, created_at, updated_at)
     VALUES (:student_no, :name, :section_code, :program, :grade, NOW(), NOW())
     ON DUPLICATE KEY UPDATE grade = VALUES(grade), updated_at = NOW()'
);

$insert->execute([
    'student_no'   => '2024-00999',
    'name'         => 'Dela Cruz, Sample A.',
    'section_code' => 'CWTS-1A',
    'program'      => 'BSIT',
    'grade'        => 'pass',
]);

// Fetch all with grade
$stmt = $pdo->query(
    "SELECT id, student_no, name, section_code, grade
     FROM students
     WHERE grade IN ('pass', 'fail')
     ORDER BY section_code, name"
);

$rows = $stmt->fetchAll();

if (PHP_SAPI !== 'cli') {
    header('Content-Type: application/json');
}

echo json_encode(['success' => true, 'students' => $rows], JSON_PRETTY_PRINT);
