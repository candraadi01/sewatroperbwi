-- Apply after 019. Existing rows are preserved.
DROP POLICY IF EXISTS payout_process ON payout_requests;
CREATE POLICY payout_process ON payout_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin') AND owner_id <> auth.uid())
  WITH CHECK (has_role(auth.uid(),'admin') AND owner_id <> auth.uid()
    AND status IN ('approved','rejected','transferred'));

-- Ownership policies from 017 continue to apply. Keep generated IDs and
-- creation timestamps under database control.
REVOKE INSERT, UPDATE ON offline_schedules FROM authenticated;
GRANT INSERT (owner_id,product_id,vehicle_name,renter_name,renter_phone,start_date,end_date,notes,source),
      UPDATE (owner_id,product_id,vehicle_name,renter_name,renter_phone,start_date,end_date,notes,source,updated_at)
  ON offline_schedules TO authenticated;

REVOKE INSERT ON user_favorites FROM authenticated;
GRANT INSERT (user_id,product_id) ON user_favorites TO authenticated;

-- Public reads and Admin writes still pass through the row policies in 017.
-- TRUNCATE and other table-level privileges do not pass through RLS.
REVOKE ALL ON testimonials,destinations FROM PUBLIC,anon,authenticated;
GRANT SELECT ON testimonials,destinations TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON testimonials,destinations TO authenticated;
