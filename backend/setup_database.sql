-- CIBN Library Database Setup Script
-- Run this script as PostgreSQL superuser (postgres)

-- Create the database
CREATE DATABASE cibn_library;

-- Create user with password
CREATE USER cibn_user WITH PASSWORD 'cibn_password';

-- Grant all privileges on database to user
GRANT ALL PRIVILEGES ON DATABASE cibn_library TO cibn_user;

-- Connect to the database
\c cibn_library

-- Grant privileges on schema
GRANT ALL ON SCHEMA public TO cibn_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO cibn_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO cibn_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO cibn_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO cibn_user;

-- Verify setup
\du cibn_user
\l cibn_library
