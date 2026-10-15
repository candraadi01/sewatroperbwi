CREATE OR REPLACE FUNCTION save_admin_product(p jsonb,p_id uuid DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_product_id uuid;price_id uuid;
BEGIN
 IF NOT has_role(auth.uid(),'admin') OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND account_status='active') THEN RAISE EXCEPTION 'Admin required';END IF;
 v_product_id=coalesce(p_id,gen_random_uuid());
 INSERT INTO products(id,name,slug,category_id,service_type,status,passenger_capacity,driver_included,duration_minutes,route_name,start_point,end_point,short_description,description,cover_image_url,included_facilities,excluded_facilities,terms_version,terms_content,min_booking_hours,overtime_rate_per_hour,is_owner_approved,is_sample_data,sort_order,dp_override_percentage,default_start_time)
 VALUES(v_product_id,p->>'name',p->>'slug',nullif(p->>'category_id','')::uuid,(p->>'service_type')::service_type,(p->>'status')::product_status,(p->>'passenger_capacity')::integer,(p->>'driver_included')::boolean,(p->>'duration_minutes')::integer,p->>'route_name',p->>'start_point',p->>'end_point',p->>'short_description',p->>'description',p->>'cover_image_url',ARRAY(SELECT jsonb_array_elements_text(p->'included_facilities')),ARRAY(SELECT jsonb_array_elements_text(p->'excluded_facilities')),p->>'terms_version',p->>'terms_content',(p->>'min_booking_hours')::integer,(p->>'overtime_rate_per_hour')::integer,(p->>'is_owner_approved')::boolean,NOT (p->>'is_owner_approved')::boolean,(p->>'sort_order')::integer,nullif(p->>'dp_override_percentage','')::integer,(p->>'default_start_time')::time)
 ON CONFLICT(id) DO UPDATE SET name=excluded.name,slug=excluded.slug,category_id=excluded.category_id,service_type=excluded.service_type,status=excluded.status,passenger_capacity=excluded.passenger_capacity,driver_included=excluded.driver_included,duration_minutes=excluded.duration_minutes,route_name=excluded.route_name,start_point=excluded.start_point,end_point=excluded.end_point,short_description=excluded.short_description,description=excluded.description,cover_image_url=excluded.cover_image_url,included_facilities=excluded.included_facilities,excluded_facilities=excluded.excluded_facilities,terms_version=excluded.terms_version,terms_content=excluded.terms_content,min_booking_hours=excluded.min_booking_hours,overtime_rate_per_hour=excluded.overtime_rate_per_hour,is_owner_approved=excluded.is_owner_approved,is_sample_data=excluded.is_sample_data,sort_order=excluded.sort_order,dp_override_percentage=excluded.dp_override_percentage,default_start_time=excluded.default_start_time;
 SELECT id INTO price_id FROM pricing_rules WHERE pricing_rules.product_id=v_product_id AND name='Tarif utama' AND date_start IS NULL AND date_end IS NULL LIMIT 1 FOR UPDATE;
 IF price_id IS NULL THEN INSERT INTO pricing_rules(product_id,name,base_price,price_unit,is_active,is_sample_data,priority) VALUES(v_product_id,'Tarif utama',(p->>'base_price')::integer,'per_vehicle',true,NOT (p->>'is_owner_approved')::boolean,10);
 ELSE UPDATE pricing_rules SET base_price=(p->>'base_price')::integer,is_sample_data=NOT (p->>'is_owner_approved')::boolean,is_active=true WHERE id=price_id;END IF;
 RETURN v_product_id;
END $$;
REVOKE ALL ON FUNCTION save_admin_product(jsonb,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION save_admin_product(jsonb,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION save_business_settings(p jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE next_version integer;new_id uuid;previous business_settings_versions;
BEGIN
 IF NOT has_role(auth.uid(),'admin') OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND account_status='active') THEN RAISE EXCEPTION 'Admin required';END IF;
 PERFORM pg_advisory_xact_lock(57623987);
 SELECT coalesce(max(version),0)+1 INTO next_version FROM business_settings_versions;
 SELECT * INTO previous FROM business_settings_versions WHERE is_current ORDER BY version DESC LIMIT 1;
 UPDATE business_settings_versions SET is_current=false WHERE is_current;
 INSERT INTO business_settings_versions(version,default_dp_percentage,default_dp_nominal,dp_mode,dp_basis,confirmation_deadline_hours,balance_payment_deadline_hours,daily_duration_hours,default_pickup_included,terms_and_conditions,cancellation_policy,refund_policy,privacy_policy,is_current,created_by)
 VALUES(next_version,(p->>'default_dp_percentage')::integer,(p->>'default_dp_nominal')::integer,p->>'dp_mode',p->>'dp_basis',(p->>'confirmation_deadline_hours')::integer,(p->>'balance_payment_deadline_hours')::integer,coalesce((p->>'daily_duration_hours')::integer,previous.daily_duration_hours,12),coalesce((p->>'default_pickup_included')::boolean,previous.default_pickup_included,false),p->>'terms_and_conditions',p->>'cancellation_policy',p->>'refund_policy',p->>'privacy_policy',true,auth.uid()) RETURNING id INTO new_id;
 RETURN new_id;
END $$;
REVOKE ALL ON FUNCTION save_business_settings(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION save_business_settings(jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION prepare_balance_payment(p_booking_id uuid,p_user_id uuid,p_key uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b bookings;a payment_attempts;
BEGIN
 SELECT * INTO b FROM bookings WHERE id=p_booking_id AND user_id=p_user_id FOR UPDATE;
 IF NOT FOUND OR b.amount_paid<1 OR b.outstanding<1 OR b.status NOT IN ('payment_received','confirmed','in_progress') THEN RAISE EXCEPTION 'Booking not eligible for balance payment';END IF;
 SELECT * INTO a FROM payment_attempts WHERE booking_id=b.id AND purpose='balance' AND status='pending' ORDER BY created_at DESC LIMIT 1 FOR UPDATE;
 IF NOT FOUND THEN INSERT INTO payment_attempts(booking_id,midtrans_order_id,purpose,expected_amount,idempotency_key) VALUES(b.id,b.booking_code||'-B-'||substr(replace(p_key::text,'-',''),1,10),'balance',b.outstanding,p_key::text) RETURNING * INTO a;END IF;
 RETURN jsonb_build_object('booking',to_jsonb(b),'attempt',to_jsonb(a));
END $$;
REVOKE ALL ON FUNCTION prepare_balance_payment(uuid,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION prepare_balance_payment(uuid,uuid,uuid) TO service_role;
