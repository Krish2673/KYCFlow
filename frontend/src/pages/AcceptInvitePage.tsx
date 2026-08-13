import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import { acceptInvitation, getInvitation } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { USER_ROLE_LABELS } from '../lib/constants';

export function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, setSession } = useAuth();
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: invitation, isLoading, error: loadError } = useQuery({
    queryKey: ['invitation', token],
    queryFn: () => getInvitation(token!),
    enabled: !!token,
    retry: false,
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError('');
    setLoading(true);
    try {
      const result = await acceptInvitation(token, password, name || undefined);
      setSession(result.user, result.accessToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate account');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading invitation…</p>
      </div>
    );
  }

  if (loadError || !invitation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-red-600">{(loadError as Error)?.message ?? 'Invalid invitation'}</p>
        <Link to="/login" className="text-brand-600 hover:underline">Back to sign in</Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">KYCFlow</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900">Accept invitation</h2>
        <p className="mt-2 text-sm text-slate-500">
          You&apos;ve been invited to join <strong>{invitation.organization}</strong> as a{' '}
          <strong>{USER_ROLE_LABELS[invitation.role]}</strong>.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            id="inviteEmail"
            label="Email"
            type="email"
            value={invitation.email}
            disabled
          />
          <Input
            id="inviteName"
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <Input
            id="invitePassword"
            label="Set Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Activate Account
          </Button>
        </form>
      </div>
    </div>
  );
}
