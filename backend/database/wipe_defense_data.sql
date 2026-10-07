-- ============================================================================
--  COZY BLISSFUL — Thesis Defense Database Wipe
-- ----------------------------------------------------------------------------
--  Layunin: Burahin ang LAHAT ng stored records (bookings, history, accounts,
--  RBAC laman, notifications, audit logs, jobs, cache) habang PINAPANATILI:
--    • ang buong table structure (tables, columns, PK, FK, indexes)
--    • ang SERVICES table (landing page catalog/prices — HINDI ginalaw)
--
--  ⚠️  SAFETY WARNING — BASAHIN MUNA BAGO I-RUN  ⚠️
--  1. Mag FULL BACKUP muna:
--       mysqldump -u <user> -p <database> > backup_before_defense.sql
--  2. Ang TRUNCATE ay DDL: AGAD nagko-commit, HINDI na maibabalik (no rollback).
--  3. MABUBURA rin ang lahat ng accounts (admin/staff/client) at roles —
--     kailangang mag-reseed pagkatapos:  php artisan db:seed
--     (Safe: firstOrCreate ang seeder kaya hindi madodoble ang services.
--      Kung ayaw ng demo bookings, i-TRUNCATE uli ang appointments at
--      therapist_availabilities pagkatapos mag-seed — nasa dulo ang guide.)
--  4. Pang-defense/demo database lang ito — HUWAG sa production.
-- ============================================================================

-- Step 1: Pansamantalang i-disable ang foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: I-wipe ang lahat ng stored records (IDs babalik sa 1),
--         MALIBAN sa services (landing page catalog — PRESERVED).
--         Table structure, columns, PK at FK: INTACT.

-- --- Client bookings & history (mga binook na services) ---
TRUNCATE TABLE appointments;
TRUNCATE TABLE therapist_availabilities;
TRUNCATE TABLE notifications;
TRUNCATE TABLE audit_logs;

-- --- Accounts, tokens & sessions ---
TRUNCATE TABLE personal_access_tokens;
TRUNCATE TABLE sessions;
TRUNCATE TABLE password_reset_tokens;
TRUNCATE TABLE users;

-- --- RBAC laman (roles, permissions, pivots) ---
TRUNCATE TABLE model_has_permissions;
TRUNCATE TABLE model_has_roles;
TRUNCATE TABLE role_has_permissions;
TRUNCATE TABLE permissions;
TRUNCATE TABLE roles;

-- --- Queues, jobs & cache (system data) ---
TRUNCATE TABLE failed_jobs;
TRUNCATE TABLE jobs;
TRUNCATE TABLE job_batches;
TRUNCATE TABLE cache_locks;
TRUNCATE TABLE cache;

-- !!! HINDI ginalaw: services (prices/catalog pang-landing page) !!!

-- Step 3: I-enable ULI AGAD ang foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 4 (optional): i-verify na empty na lahat maliban sa services
SELECT table_name AS `table`, table_rows AS approx_rows
FROM information_schema.tables
WHERE table_schema = DATABASE()
ORDER BY table_name;

-- ============================================================================
--  PAGKATAPOS I-RUN:
--  1) php artisan db:seed        (ibabalik ang roles + demo accounts;
--                                  hindi madodoble ang services)
--  2) Kung ayaw ng demo bookings sa defense, i-run ito pagkatapos mag-seed:
--       SET FOREIGN_KEY_CHECKS = 0;
--       TRUNCATE TABLE appointments;
--       TRUNCATE TABLE therapist_availabilities;
--       SET FOREIGN_KEY_CHECKS = 1;
--  3) php artisan cache:clear, tapos mag-login test bawat role.
-- ============================================================================
