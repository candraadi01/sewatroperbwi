-- Read-only catalog comparison. Later revisions intentionally supersede earlier expectations.
-- Function fingerprints compare migration source, so equivalent reformatting can report DIFFERENT.
BEGIN TRANSACTION READ ONLY;
SET LOCAL search_path = public, pg_catalog;

WITH checks(migration, kind, object, expected, actual) AS (
  SELECT v.migration, 'COLUMN', v.tbl||'.'||v.col, v.typ, c.data_type::text
  FROM (VALUES ('016','products','default_start_time','text'),
               ('017','payment_attempts','choice_locked_at','timestamp with time zone')) v(migration,tbl,col,typ)
  LEFT JOIN information_schema.columns c ON c.table_schema='public' AND c.table_name=v.tbl AND c.column_name=v.col

  UNION ALL
  SELECT v.migration, 'FUNCTION', v.signature, v.fingerprint,
    CASE WHEN p.oid IS NOT NULL THEN md5(replace(btrim(p.prosrc,E' \r\n\t'),E'\r\n',E'\n')) ||
      CASE WHEN p.prosecdef AND p.proconfig @> ARRAY['search_path=public'] THEN '' ELSE ' (security settings differ)' END END
  FROM (VALUES ('016','public.save_admin_product(jsonb, uuid)','db28be6c341405eea14f2d59b32cacab'),
    ('017','public.admin_approve_with_time(uuid, text, integer, time without time zone)','e35747a3f6d3ec4da4a7689bc623c090'),
    ('017','public.admin_update_trip(uuid, booking_status, text, time without time zone)','41a6be0dc63560eab88a95956382c415'),
    ('017','public.apply_midtrans_event(jsonb)','f5a5753d7939d47260c7fc340392b97c'),
    ('017','public.approve_booking(uuid, text, integer)','52eba182a1a8eb4899bec240945417f5'),
    ('017','public.prepare_initial_payment(uuid, uuid, payment_purpose)','7e51004a582d9bf7fb90081482f02d01'),
    ('017','public.reject_booking(uuid, text)','ed2a981ecfac8efe99ea5b9bf29258fc'),
    ('018','public.apply_midtrans_event(jsonb)','abf6a71a6e2175bd4709581d775358e7'),
    ('019','public.approve_booking(uuid, text, integer)','4bcd68310242f075deae456657fe5be7')) v(migration,signature,fingerprint)
  LEFT JOIN pg_proc p ON p.oid=to_regprocedure(v.signature)

  UNION ALL
  SELECT v.migration, 'FUNCTION EXECUTE', v.signature||' / '||r.role, r.allowed,
         CASE WHEN to_regprocedure(v.signature) IS NOT NULL
           THEN has_function_privilege(r.role,to_regprocedure(v.signature),'EXECUTE')::text END
  FROM (VALUES ('017','public.approve_booking(uuid,text,integer)',true),
    ('017','public.reject_booking(uuid,text)',true),
    ('017','public.admin_approve_with_time(uuid,text,integer,time)',true),
    ('017','public.admin_update_trip(uuid,public.booking_status,text,time)',true),
    ('017','public.prepare_initial_payment(uuid,uuid,public.payment_purpose)',false),
    ('018','public.apply_midtrans_event(jsonb)',false)) v(migration,signature,user_allowed)
  CROSS JOIN LATERAL (VALUES ('anon','false'),('authenticated',v.user_allowed::text)) r(role,allowed)

  UNION ALL
  SELECT v.migration,'FUNCTION EXECUTE',v.signature||' / service_role','true',
    CASE WHEN to_regprocedure(v.signature) IS NOT NULL THEN
      has_function_privilege('service_role',to_regprocedure(v.signature),'EXECUTE')::text END
  FROM (VALUES ('017','public.prepare_initial_payment(uuid,uuid,public.payment_purpose)'),
    ('018','public.apply_midtrans_event(jsonb)')) v(migration,signature)

  UNION ALL
  SELECT 'prerequisite','TRIGGER',v.tbl||'.'||v.name,'enabled; BEFORE UPDATE FOR EACH ROW; '||v.fn,
    CASE WHEN t.oid IS NOT NULL THEN
      (CASE t.tgenabled WHEN 'O' THEN 'enabled' ELSE t.tgenabled::text END)||'; '||
      (CASE WHEN t.tgtype=19 THEN 'BEFORE UPDATE FOR EACH ROW' ELSE 'unexpected trigger type' END)||'; '||f.proname END
  FROM (VALUES ('bookings','protect_booking_finances_before_update','protect_booking_finances'),
    ('profiles','protect_profile_before_update','protect_profile_fields')) v(tbl,name,fn)
  LEFT JOIN pg_trigger t ON t.tgrelid=to_regclass('public.'||v.tbl) AND t.tgname=v.name AND NOT t.tgisinternal
  LEFT JOIN pg_proc f ON f.oid=t.tgfoid AND f.pronamespace='public'::regnamespace

  UNION ALL
  SELECT '017','RLS',v.tbl,'true',c.relrowsecurity::text
  FROM (VALUES ('payout_requests'),('offline_schedules'),('user_favorites'),('testimonials'),('destinations'),
    ('sales_quotas'),('blackout_dates')) v(tbl)
  LEFT JOIN pg_class c ON c.oid=to_regclass('public.'||v.tbl)

  UNION ALL
  SELECT v.migration,'POLICY',v.tbl||'.'||v.name,
    CASE WHEN v.cmd IS NULL THEN 'absent' ELSE concat_ws(' | ',v.cmd,v.roles,v.qual,v.chk) END,
    CASE WHEN p.policyname IS NULL AND v.cmd IS NULL THEN 'absent'
         WHEN p.policyname IS NOT NULL THEN concat_ws(' | ',p.cmd,p.roles::text,
           regexp_replace(p.qual,'[[:space:]()]','','g'),regexp_replace(p.with_check,'[[:space:]()]','','g'),
           CASE WHEN p.permissive <> 'PERMISSIVE' THEN p.permissive END) END
  FROM (VALUES ('014','blackout_dates','blackout_admin_and_owner_all','ALL','{authenticated}','has_roleauth.uid,''admin''::app_roleORhas_roleauth.uid,''owner''::app_role','has_roleauth.uid,''admin''::app_roleORhas_roleauth.uid,''owner''::app_role'),
    ('014','sales_quotas','quotas_admin_and_owner_all','ALL','{authenticated}','has_roleauth.uid,''admin''::app_roleORhas_roleauth.uid,''owner''::app_role','has_roleauth.uid,''admin''::app_roleORhas_roleauth.uid,''owner''::app_role'),
    ('014','blackout_dates','blackout_admin_all',NULL,NULL,NULL,NULL),
    ('014','sales_quotas','quotas_admin_all',NULL,NULL,NULL,NULL),
    ('017','payout_requests','payout_read','SELECT','{authenticated}','has_roleauth.uid,''admin''::app_roleORowner_id=auth.uidANDhas_roleauth.uid,''owner''::app_role',NULL),
    ('017','payout_requests','payout_request','INSERT','{authenticated}',NULL,'owner_id=auth.uidANDhas_roleauth.uid,''owner''::app_roleORhas_roleauth.uid,''admin''::app_roleANDstatus=''pending''::textANDprocessed_atISNULLANDamount>=100000'),
    ('017','payout_requests','payout_process','UPDATE','{authenticated}','has_roleauth.uid,''admin''::app_role','has_roleauth.uid,''admin''::app_role'),
    ('017','offline_schedules','offline_scope','ALL','{authenticated}','has_roleauth.uid,''admin''::app_roleORowner_id=auth.uidANDhas_roleauth.uid,''owner''::app_role','has_roleauth.uid,''admin''::app_roleORowner_id=auth.uidANDhas_roleauth.uid,''owner''::app_role'),
    ('017','user_favorites','personal_favorites','ALL','{authenticated}','user_id=auth.uidANDhas_roleauth.uid,''buyer''::app_role','user_id=auth.uidANDhas_roleauth.uid,''buyer''::app_role'),
    ('017','blackout_dates','blackout_admin_write','ALL','{authenticated}','has_roleauth.uid,''admin''::app_role','has_roleauth.uid,''admin''::app_role'),
    ('017','sales_quotas','quotas_admin_write','ALL','{authenticated}','has_roleauth.uid,''admin''::app_role','has_roleauth.uid,''admin''::app_role'),
    ('017','testimonials','testimonials_public_read','SELECT','{anon,authenticated}','is_active',NULL),
    ('017','testimonials','testimonials_admin_write','ALL','{authenticated}','has_roleauth.uid,''admin''::app_role','has_roleauth.uid,''admin''::app_role'),
    ('017','destinations','destinations_public_read','SELECT','{anon,authenticated}','is_active',NULL),
    ('017','destinations','destinations_admin_write','ALL','{authenticated}','has_roleauth.uid,''admin''::app_role','has_roleauth.uid,''admin''::app_role'),
    ('017','blackout_dates','blackout_admin_and_owner_all',NULL,NULL,NULL,NULL),
    ('017','sales_quotas','quotas_admin_and_owner_all',NULL,NULL,NULL,NULL),
    ('020','payout_requests','payout_process','UPDATE','{authenticated}','has_roleauth.uid,''admin''::app_roleANDowner_id<>auth.uid','has_roleauth.uid,''admin''::app_roleANDowner_id<>auth.uidANDstatus=ANYARRAY[''approved''::text,''rejected''::text,''transferred''::text]')) v(migration,tbl,name,cmd,roles,qual,chk)
  LEFT JOIN pg_policies p ON p.schemaname='public' AND p.tablename=v.tbl AND p.policyname=v.name

  UNION ALL
  SELECT v.migration,'TABLE GRANT',v.tbl||' / '||v.role,v.ops,
    CASE WHEN c.oid IS NOT NULL THEN coalesce((SELECT string_agg(op,',' ORDER BY op)
      FROM unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) op
      WHERE has_table_privilege(v.role,c.oid,op)), '') END
  FROM (VALUES ('017','payout_requests','authenticated','SELECT'),
    ('017','offline_schedules','authenticated','DELETE,INSERT,SELECT,UPDATE'),
    ('017','user_favorites','authenticated','DELETE,INSERT,SELECT'),
    ('020','offline_schedules','authenticated','DELETE,SELECT'),
    ('020','user_favorites','authenticated','DELETE,SELECT'),
    ('020','testimonials','authenticated','DELETE,INSERT,SELECT,UPDATE'),
    ('020','destinations','authenticated','DELETE,INSERT,SELECT,UPDATE'),
    ('020','testimonials','anon','SELECT'),('020','destinations','anon','SELECT'),
    ('017','payout_requests','anon',''),('017','offline_schedules','anon',''),('017','user_favorites','anon','')
  ) v(migration,tbl,role,ops) LEFT JOIN pg_class c ON c.oid=to_regclass('public.'||v.tbl)

  UNION ALL
  SELECT v.migration,'COLUMN GRANT',v.tbl||' / authenticated / '||v.op,v.cols,
    CASE WHEN c.oid IS NOT NULL THEN coalesce((SELECT string_agg(a.attname::text,',' ORDER BY a.attname::text COLLATE "C")
      FROM pg_attribute a WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
      AND has_column_privilege('authenticated',c.oid,a.attnum,v.op)), '') END
  FROM (VALUES ('017','payout_requests','INSERT','account_holder,account_number,amount,bank_name,owner_id'),
    ('017','payout_requests','UPDATE','admin_notes,processed_at,status,transfer_proof_url'),
    ('020','offline_schedules','INSERT','end_date,notes,owner_id,product_id,renter_name,renter_phone,source,start_date,vehicle_name'),
    ('020','offline_schedules','UPDATE','end_date,notes,owner_id,product_id,renter_name,renter_phone,source,start_date,updated_at,vehicle_name'),
    ('020','user_favorites','INSERT','product_id,user_id')
  ) v(migration,tbl,op,cols) LEFT JOIN pg_class c ON c.oid=to_regclass('public.'||v.tbl)
)
SELECT migration,kind,object,CASE WHEN actual IS NULL THEN 'MISSING'
  WHEN actual=expected THEN 'MATCH' ELSE 'DIFFERENT' END AS status,expected,actual
FROM checks ORDER BY migration,kind,object;

ROLLBACK;
