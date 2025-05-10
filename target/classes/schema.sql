-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS dental_db;

-- Use the database
USE dental_db;

-- Create the appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    dni VARCHAR(20) NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_date DATE NOT NULL
);
