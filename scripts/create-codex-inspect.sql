-- Run manually as a database administrator in Supabase SQL Editor.
-- New roles start with NOLOGIN. Set the password separately with psql
-- \password, then enable LOGIN only after these checks pass.
-- This script never changes passwords, login status, or grants on other roles.
BEGIN;
SET LOCAL search_path = pg_catalog;

DO $provision$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'codex_inspect') THEN
    CREATE ROLE codex_inspect NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS
      NOCREATEROLE NOCREATEDB NOREPLICATION;
  END IF;
END
$provision$;

DO $verify$
DECLARE
  inspector pg_roles%ROWTYPE;
  unsafe_functions text;
BEGIN
  SELECT * INTO STRICT inspector FROM pg_roles WHERE rolname = 'codex_inspect';

  IF inspector.rolsuper OR inspector.rolbypassrls OR inspector.rolcreaterole
     OR inspector.rolcreatedb OR inspector.rolreplication THEN
    RAISE EXCEPTION 'INSPECT provisioning stopped. Role has administrative attributes.';
  END IF;

  -- Reject any membership, even if it does not currently inherit privileges.
  IF EXISTS (SELECT 1 FROM pg_auth_members WHERE member = inspector.oid) THEN
    RAISE EXCEPTION 'INSPECT provisioning stopped. Review role memberships.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_shdepend
    WHERE refclassid = 'pg_authid'::regclass AND refobjid = inspector.oid
      AND deptype = 'o'
  ) THEN
    RAISE EXCEPTION 'INSPECT provisioning stopped. Role owns database objects.';
  END IF;

  IF has_database_privilege(inspector.oid, current_database(), 'CREATE')
     OR EXISTS (
       SELECT 1 FROM pg_namespace n
       WHERE has_schema_privilege(inspector.oid, n.oid, 'CREATE')
     )
     OR EXISTS (
       SELECT 1 FROM pg_class c
       WHERE CASE
         WHEN c.relkind IN ('r', 'p', 'v', 'm', 'f') THEN
           has_table_privilege(inspector.oid, c.oid, 'INSERT,UPDATE,DELETE,TRUNCATE,TRIGGER,REFERENCES')
           OR has_any_column_privilege(inspector.oid, c.oid, 'INSERT,UPDATE,REFERENCES')
         WHEN c.relkind = 'S' THEN
           has_sequence_privilege(inspector.oid, c.oid, 'USAGE,UPDATE')
         ELSE false
       END
     )
  THEN
    RAISE EXCEPTION 'INSPECT provisioning stopped. Review effective write or DDL privileges.';
  END IF;

  IF current_setting('server_version_num')::integer >= 170000 AND EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind IN ('r', 'p', 'm')
      AND has_table_privilege(inspector.oid, c.oid, 'MAINTAIN')
  ) THEN
    RAISE EXCEPTION 'INSPECT provisioning stopped. Review effective MAINTAIN privileges.';
  END IF;

  -- Effective EXECUTE includes PUBLIC. Trigger-only functions cannot be called
  -- directly. Review all other accessible, non-system SECURITY DEFINER routines.
  SELECT string_agg(p.oid::regprocedure::text, ', ' ORDER BY p.oid)
    INTO unsafe_functions
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
    AND p.prosecdef
    AND p.prorettype NOT IN ('trigger'::regtype, 'event_trigger'::regtype)
    AND has_schema_privilege(inspector.oid, n.oid, 'USAGE')
    AND has_function_privilege(inspector.oid, p.oid, 'EXECUTE');

  IF unsafe_functions IS NOT NULL THEN
    RAISE EXCEPTION 'INSPECT provisioning stopped. Review EXECUTE on: %', unsafe_functions;
  END IF;
END
$verify$;

-- Defense in depth. Effective ACLs, not these defaults, enforce access limits.
ALTER ROLE codex_inspect SET default_transaction_read_only = on;
ALTER ROLE codex_inspect SET statement_timeout = '5s';

COMMIT;
