-- 009_alter_enum_owner.sql
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'owner';
