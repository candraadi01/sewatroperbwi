-- 014_schedule_and_owner_policies.sql
-- Allow Admin and Owner to manage blackout dates (availability) and sales quotas

DROP POLICY IF EXISTS blackout_admin_all ON blackout_dates;
CREATE POLICY blackout_admin_and_owner_all ON blackout_dates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS quotas_admin_all ON sales_quotas;
CREATE POLICY quotas_admin_and_owner_all ON sales_quotas
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));
