import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { requestOtp } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';

type LoginMode = 'password' | 'otp';

export function LoginPage() {
  const { login, loginWithOtp, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<LoginMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const resetOtpFlow = () => {
    setOtp('');
    setOtpSent(false);
    setError('');
  };

  const switchMode = (next: LoginMode) => {
    setMode(next);
    resetOtpFlow();
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestOtp(email);
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithOtp(email, otp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-800 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white" />
          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white" />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">KYCFlow</span>
        </div>
        <div className="relative space-y-4">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Streamline your<br />KYC compliance
          </h1>
          <p className="max-w-md text-lg text-brand-100">
            Manage applications, verify documents, assess risk, and track every step of the
            customer onboarding journey.
          </p>
          <ul className="space-y-2 text-sm text-brand-100">
            <li>• Multi-tenant organization management</li>
            <li>• Document upload & verification workflow</li>
            <li>• Automated risk scoring & manual review</li>
          </ul>
        </div>
        <p className="relative text-sm text-brand-200">
          Secure · Compliant · Multi-tenant
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">KYCFlow</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to your account to continue
          </p>

          <div className="mt-6 flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            {(['password', 'otp'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => switchMode(tab)}
                className={cn(
                  'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  mode === tab
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                {tab === 'password' ? 'Password' : 'Email OTP'}
              </button>
            ))}
          </div>

          {mode === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
              <Input
                id="email"
                label="Email address"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              {error && <AuthError message={error} />}

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Sign in
              </Button>
            </form>
          ) : (
            <form
              onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp}
              className="mt-6 space-y-5"
            >
              <Input
                id="otpEmail"
                label="Email address"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={otpSent}
              />

              {otpSent && (
                <Input
                  id="otp"
                  label="One-time password"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  autoComplete="one-time-code"
                />
              )}

              {error && <AuthError message={error} />}

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                {otpSent ? 'Verify & Sign in' : 'Send OTP'}
              </Button>

              {otpSent && (
                <button
                  type="button"
                  className="w-full text-sm text-brand-600 hover:text-brand-700"
                  onClick={resetOtpFlow}
                >
                  Use a different email
                </button>
              )}
            </form>
          )}

          <p className="mt-8 text-center text-xs text-slate-400">
            Demo: admin@zerodha.com / password123
          </p>
          <p className="mt-3 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}
