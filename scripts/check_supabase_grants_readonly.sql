-- Read-only audit of PUBLIC schema table, column and function ACLs.
-- Does not show passwords, rows of application data, or service tokens.
WITH grants AS (
  SELECT 'table'::text AS object_type,
         format('%I.%I', n.nspname, c.relname) AS object_name,
         CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END AS grantee,
         a.privilege_type::text AS privilege,
         a.is_grantable AS grantable
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  CROSS JOIN LATERAL aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a
  WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','f')
  UNION ALL
  SELECT 'column',format('%I.%I.%I',n.nspname,c.relname,att.attname),
         CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END,
         a.privilege_type::text,a.is_grantable
  FROM pg_attribute att JOIN pg_class c ON c.oid=att.attrelid
  JOIN pg_namespace n ON n.oid=c.relnamespace
  CROSS JOIN LATERAL aclexplode(att.attacl) a
  WHERE n.nspname='public' AND att.attnum>0 AND NOT att.attisdropped AND c.relkind IN ('r','p','v','m','f')
  UNION ALL
  SELECT 'function',format('%I.%I(%s)',n.nspname,p.proname,pg_get_function_identity_arguments(p.oid)),
         CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END,
         a.privilege_type::text,a.is_grantable
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  CROSS JOIN LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
  WHERE n.nspname='public'
)
SELECT object_type,object_name,grantee,privilege,grantable
FROM grants
ORDER BY object_type,object_name,grantee,privilege;
