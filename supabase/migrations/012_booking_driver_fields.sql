-- 012_booking_driver_fields.sql
-- Additive migration for assigning driver and vehicle details to bookings

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_driver_name TEXT DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_driver_phone TEXT DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_vehicle_plate TEXT DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_vehicle_model TEXT DEFAULT '';
