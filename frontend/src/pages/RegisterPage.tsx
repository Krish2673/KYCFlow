import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Shield, User } from 'lucide-react';
import { registerApplicant, registerOrganization } from '../api/auth';
import { getPublicTenants } from '../api/tenants';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { cn } from '../lib/utils';

type RegisterMode = 'applicant' | 'organization';

export function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<RegisterMode>('applicant');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [tenantId, setTenantId] = useState('');

  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['public-tenants'],
    queryFn: getPublicTenants,
    enabled: mode === 'applicant',
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const resetForm = () => {
    setError('');
    setSuccess('');
  };

  const handleApplicantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const message = await registerApplicant({ name, email, password, tenantId });
      setSuccess(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const message = await registerOrganization({ orgName, name, email, password });
      setSuccess(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const orgOptions = [
    { value: '', label: orgsLoading ? 'Loading organizations…' : 'Select your organization' },
    ...(organizations?.map((org) => ({ value: org.id, label: org.name })) ?? []),
  ];

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-2/5 overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-800 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">KYCFlow</span>
        </div>
        <div className="relative space-y-4">
          <h1 className="text-3xl font-bold leading-tight text-white">Join KYCFlow</h1>
          <p className="text-brand-100">
            Register as an applicant to complete KYC with your organization, or create a new
            organization to manage your team&apos;s compliance workflow.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">Create an account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>

          <div className="mt-6 flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => { setMode('applicant'); resetForm(); }}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                mode === 'applicant' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500',
              )}
            >
              <User className="h-4 w-4" />
              Applicant
            </button>
            <button
              type="button"
              onClick={() => { setMode('organization'); resetForm(); }}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                mode === 'organization' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500',
              )}
            >
              <Building2 className="h-4 w-4" />
              Organization
            </button>
          </div>

          {success ? (
            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
              <p className="font-medium">{success}</p>
              <Link to="/login" className="mt-3 inline-block text-brand-600 hover:underline">
                Go to sign in →
              </Link>
            </div>
          ) : mode === 'applicant' ? (
            <form onSubmit={handleApplicantSubmit} className="mt-6 space-y-4">
              <p className="text-sm text-slate-600">
                Select your organization. An admin must approve your account before you can start
                your KYC application.
              </p>
              <Select
                label="Organization"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                options={orgOptions}
                required
              />
              <Input id="regName" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input id="regEmail" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input id="regPassword" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              {error && <Alert message={error} />}
              <Button type="submit" className="w-full" loading={loading}>Register as Applicant</Button>
            </form>
          ) : (
            <form onSubmit={handleOrganizationSubmit} className="mt-6 space-y-4">
              <p className="text-sm text-slate-600">
                Create your organization and become the Tenant Admin. You can invite reviewers and
                approve applicants after signing in.
              </p>
              <Input id="orgName" label="Organization Name" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
              <Input id="adminName" label="Your Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input id="adminEmail" label="Work Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input id="adminPassword" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              {error && <Alert message={error} />}
              <Button type="submit" className="w-full" loading={loading}>Create Organization</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Alert({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}
