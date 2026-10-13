'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mountain, Mail, AlertCircle } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(
    errorParam === 'auth_callback_failed'
      ? 'Gagal masuk. Silakan coba lagi.'
      : ''
  );

  const supabase = createClient();

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setError('Gagal masuk dengan Google. Silakan coba lagi.');
      setGoogleLoading(false);
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setError('Gagal mengirim link masuk. Periksa alamat email dan coba lagi.');
    } else {
      setMessage(
        'Link masuk telah dikirim ke email Anda. Periksa kotak masuk (dan folder spam) Anda.'
      );
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-primary-700"
          >
            <Mountain size={36} strokeWidth={2.5} />
            <div className="flex flex-col leading-tight text-left">
              <span className="font-bold text-xl">Sewa Trooper</span>
              <span className="text-xs text-neutral-500">Banyuwangi</span>
            </div>
          </Link>
        </div>

        <Card variant="elevated" padding="lg">
          <div className="text-center mb-6">
            <h1 className="heading-2 text-neutral-900">Masuk</h1>
            <p className="text-neutral-600 mt-1">
              Masuk untuk melanjutkan pemesanan Anda
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
              role="alert"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success message */}
          {message && (
            <div
              className="flex items-start gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"
              role="alert"
            >
              <Mail size={18} className="shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {/* Google Login */}
          <Button
            variant="outline"
            fullWidth
            onClick={handleGoogleLogin}
            loading={googleLoading}
            disabled={loading}
            className="mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Masuk dengan Google
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-neutral-200" />
            <span className="text-sm text-neutral-400">atau</span>
            <div className="flex-1 border-t border-neutral-200" />
          </div>

          {/* Email Login */}
          <form onSubmit={handleEmailLogin}>
            <Input
              label="Alamat Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || googleLoading}
              autoComplete="email"
            />
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={googleLoading || !email.trim()}
              className="mt-4"
            >
              <Mail size={18} />
              Kirim Link Masuk
            </Button>
          </form>

          <p className="text-xs text-neutral-400 text-center mt-6">
            Dengan masuk, Anda menyetujui{' '}
            <Link
              href="/syarat-ketentuan"
              className="text-primary-600 hover:underline"
            >
              Syarat & Ketentuan
            </Link>{' '}
            dan{' '}
            <Link
              href="/kebijakan-privasi"
              className="text-primary-600 hover:underline"
            >
              Kebijakan Privasi
            </Link>{' '}
            kami.
          </p>
        </Card>

        <p className="text-center mt-6 text-sm text-neutral-500">
          <Link
            href="/"
            className="text-primary-600 hover:underline font-medium"
          >
            ← Kembali ke Beranda
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-sand-50">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
