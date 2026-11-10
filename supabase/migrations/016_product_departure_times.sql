-- Migration 016: Ubah default_start_time menjadi text agar mendukung multiple jam keberangkatan
ALTER TABLE products ALTER COLUMN default_start_time TYPE text USING default_start_time::text;

-- Update save_admin_product function to support text default_start_time
CREATE OR REPLACE FUNCTION save_admin_product(p jsonb,p_id uuid DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_product_id uuid;price_id uuid;
BEGIN
 IF NOT has_role(auth.uid(),'admin') OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND account_status='active') THEN RAISE EXCEPTION 'Admin required';END IF;
 v_product_id=coalesce(p_id,gen_random_uuid());
 INSERT INTO products(id,name,slug,category_id,service_type,status,passenger_capacity,driver_included,duration_minutes,route_name,start_point,end_point,short_description,description,cover_image_url,included_facilities,excluded_facilities,terms_version,terms_content,min_booking_hours,overtime_rate_per_hour,is_owner_approved,is_sample_data,sort_order,dp_override_percentage,default_start_time)
 VALUES(v_product_id,p->>'name',p->>'slug',nullif(p->>'category_id','')::uuid,(p->>'service_type')::service_type,(p->>'status')::product_status,(p->>'passenger_capacity')::integer,(p->>'driver_included')::boolean,(p->>'duration_minutes')::integer,p->>'route_name',p->>'start_point',p->>'end_point',p->>'short_description',p->>'description',p->>'cover_image_url',ARRAY(SELECT jsonb_array_elements_text(p->'included_facilities')),ARRAY(SELECT jsonb_array_elements_text(p->'excluded_facilities')),p->>'terms_version',p->>'terms_content',(p->>'min_booking_hours')::integer,(p->>'overtime_rate_per_hour')::integer,(p->>'is_owner_approved')::boolean,NOT (p->>'is_owner_approved')::boolean,(p->>'sort_order')::integer,nullif(p->>'dp_override_percentage','')::integer,coalesce(nullif(p->>'default_start_time',''),'08:00')::text)
 ON CONFLICT(id) DO UPDATE SET name=excluded.name,slug=excluded.slug,category_id=excluded.category_id,service_type=excluded.service_type,status=excluded.status,passenger_capacity=excluded.passenger_capacity,driver_included=excluded.driver_included,duration_minutes=excluded.duration_minutes,route_name=excluded.route_name,start_point=excluded.start_point,end_point=excluded.end_point,short_description=excluded.short_description,description=excluded.description,cover_image_url=excluded.cover_image_url,included_facilities=excluded.included_facilities,excluded_facilities=excluded.excluded_facilities,terms_version=excluded.terms_version,terms_content=excluded.terms_content,min_booking_hours=excluded.min_booking_hours,overtime_rate_per_hour=excluded.overtime_rate_per_hour,is_owner_approved=excluded.is_owner_approved,is_sample_data=excluded.is_sample_data,sort_order=excluded.sort_order,dp_override_percentage=excluded.dp_override_percentage,default_start_time=excluded.default_start_time;
 SELECT id INTO price_id FROM pricing_rules WHERE pricing_rules.product_id=v_product_id AND name='Tarif utama' AND date_start IS NULL AND date_end IS NULL LIMIT 1 FOR UPDATE;
 IF price_id IS NULL THEN INSERT INTO pricing_rules(product_id,name,base_price,price_unit,is_active,is_sample_data,priority) VALUES(v_product_id,'Tarif utama',(p->>'base_price')::integer,'per_vehicle',true,NOT (p->>'is_owner_approved')::boolean,10);
 ELSE UPDATE pricing_rules SET base_price=(p->>'base_price')::integer,is_sample_data=NOT (p->>'is_owner_approved')::boolean,is_active=true WHERE id=price_id;END IF;
 RETURN v_product_id;
END $$;

