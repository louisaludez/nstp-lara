<?php
/**
 * Standalone PDO connection for XAMPP (MySQL).
 * Database: nstp_db | User: root | Password: (empty)
 *
 * Usage:
 *   $pdo = require __DIR__ . '/connect.php';
 *   $stmt = $pdo->query('SELECT id, name, grade FROM students');
 */

$host     = 'localhost';
$db       = 'nstp_db';
$user     = 'root';
$pass     = getenv('DB_PASSWORD') ?: '123456789';
$charset  = 'utf8mb4';

$dsn = "mysql:host={$host};dbname={$db};charset={$charset}";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    return new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    die('Database connection failed: ' . $e->getMessage());
}
