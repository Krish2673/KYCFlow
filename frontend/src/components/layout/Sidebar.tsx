import { NavLink } from 'react-router-dom';
import {
  Building2,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../../api/applications';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['TENANT_ADMIN', 'REVIEWER', 'SUPER_ADMIN', 'APPLICANT'] as const },
  { to: '/applications', label: 'Applications', icon: ClipboardList, roles: ['TENANT_ADMIN', 'SUPER_ADMIN'] as const },
  { to: '/inbox', label: 'My Inbox', icon: Inbox, roles: ['REVIEWER', 'TENANT_ADMIN', 'SUPER_ADMIN'] as const },
  { to: '/users', label: 'Users', icon: Users, roles: ['TENANT_ADMIN', 'SUPER_ADMIN'] as const },
  { to: '/tenants', label: 'Tenants', icon: Building2, roles: ['SUPER_ADMIN'] as const },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const { user, hasRole } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: !!user,
  });

  const visibleItems = navItems.filter((item) =>
    item.roles.some((role) => hasRole(role)),
  );

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">KYCFlow</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              KYC Platform
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close menu"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
            {profile?.tenant && (
              <p className="mt-1 truncate text-xs text-slate-500">{profile.tenant.name}</p>
            )}
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-brand-600">
              {user.role.replace('_', ' ')}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
