-- NSTP Portal — XAMPP / MySQL setup
-- Run in phpMyAdmin or: mysql -u root < database/sql/nstp_db_setup.sql

CREATE DATABASE IF NOT EXISTS `nstp_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `nstp_db`;

CREATE TABLE IF NOT EXISTS `students` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_no` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `section_code` VARCHAR(64) NOT NULL,
  `program` VARCHAR(64) NULL,
  `gender` VARCHAR(16) NULL,
  `dob` VARCHAR(64) NULL,
  `birth_place` VARCHAR(255) NULL,
  `address` VARCHAR(500) NULL,
  `cell_no` VARCHAR(32) NULL,
  `email` VARCHAR(255) NULL,
  `instructor` VARCHAR(255) NULL,
  `school_year` VARCHAR(32) NOT NULL DEFAULT '2025-2026',
  `room` VARCHAR(64) NULL,
  `grade` ENUM('pass', 'fail') NULL COMMENT 'pass or fail NSTP status',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `students_student_no_section_code_unique` (`student_no`, `section_code`),
  KEY `students_section_code_index` (`section_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- If you already have a students table without grade, run only:
-- ALTER TABLE `students`
--   ADD COLUMN `grade` ENUM('pass', 'fail') NULL COMMENT 'pass or fail NSTP status' AFTER `room`;
