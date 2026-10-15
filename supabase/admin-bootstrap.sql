-- Jalankan sebagai pemilik database di Supabase SQL Editor SETELAH user login.
-- Ganti email di bawah dengan email pemilik yang sudah Anda verifikasi.
DO $$
DECLARE owner_id uuid;
BEGIN
 SELECT id INTO owner_id FROM auth.users WHERE lower(email)=lower('GANTI_DENGAN_EMAIL_OWNER@example.com');
 IF owner_id IS NULL THEN RAISE EXCEPTION 'Email belum terdaftar. Login terlebih dahulu atau periksa email.';END IF;
 IF NOT EXISTS(SELECT 1 FROM profiles WHERE id=owner_id AND account_status='active') THEN RAISE EXCEPTION 'Profil aktif tidak ditemukan. Periksa trigger/profil terlebih dahulu.';END IF;
 INSERT INTO user_roles(user_id,role) VALUES(owner_id,'admin') ON CONFLICT(user_id,role) DO NOTHING;
END $$;
