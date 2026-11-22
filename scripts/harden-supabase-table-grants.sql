-- Review and test after schema reconciliation. This script changes ACLs only.
BEGIN;
SET LOCAL search_path = pg_catalog;
SET LOCAL lock_timeout = '5s';

DO $hardening$
DECLARE
  relation record;
  client_role text;
  privilege_name text;
  blocked text[] := ARRAY['TRUNCATE', 'TRIGGER'];
BEGIN
  IF current_setting('server_version_num')::integer >= 170000 THEN
    blocked := array_append(blocked, 'MAINTAIN');
  END IF;

  FOR relation IN
    SELECT c.oid, c.relname
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
    ORDER BY c.relname
  LOOP
    FOREACH privilege_name IN ARRAY blocked LOOP
      EXECUTE format('REVOKE %s ON TABLE public.%I FROM PUBLIC, anon, authenticated',
                     privilege_name, relation.relname);
      FOREACH client_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
        IF has_table_privilege(client_role, relation.oid, privilege_name) THEN
          RAISE EXCEPTION 'Effective % on public.% remains for %. Review ownership, grantors and role membership.',
                          privilege_name, relation.relname, client_role;
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;
END
$hardening$;

COMMIT;
