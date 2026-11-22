BEGIN READ ONLY;

SELECT client.rolname AS client_role, parent.rolname AS reachable_role,
       pg_has_role(client.oid, parent.oid, 'USAGE') AS inherits_privileges,
       parent.rolsuper, parent.rolbypassrls
FROM pg_roles client CROSS JOIN pg_roles parent
WHERE client.rolname IN ('anon','authenticated','service_role')
  AND pg_has_role(client.oid, parent.oid, 'MEMBER')
ORDER BY 1,2;

SELECT c.oid::regclass AS table_name, a.attname AS column_name,
       CASE WHEN acl.grantee = 0 THEN 'PUBLIC' ELSE pg_get_userbyid(acl.grantee) END AS grantee,
       acl.privilege_type, acl.is_grantable
FROM pg_class c JOIN pg_attribute a ON a.attrelid = c.oid
CROSS JOIN LATERAL aclexplode(a.attacl) acl
WHERE c.relnamespace = 'public'::regnamespace AND a.attnum > 0 AND NOT a.attisdropped
ORDER BY 1,2,3,4;

SELECT p.oid::regprocedure AS routine, pg_get_userbyid(p.proowner) AS owner,
       p.prosecdef AS security_definer, p.proconfig,
       has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute,
       has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_execute,
       has_function_privilege('service_role',p.oid,'EXECUTE') AS service_execute
FROM pg_proc p
WHERE p.pronamespace = 'public'::regnamespace AND p.prokind IN ('f','p')
ORDER BY 1;

ROLLBACK;
