-- Create database
CREATE DATABASE cibn_library;

-- Create user
CREATE USER cibn_user WITH PASSWORD 'cibn_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cibn_library TO cibn_user;

-- Connect to the database
\c cibn_library

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO cibn_user;

