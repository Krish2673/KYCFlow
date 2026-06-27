import { NavLink } from 'react-router-dom';
import {
  Building2,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  Shield,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['TENANT_ADMIN', 'REVIEWER', 'SUPER_ADMIN'] as const },
  { to: '/applications', label: 'Applications', icon: ClipboardList, roles: ['TENANT_ADMIN', 'SUPER_ADMIN'] as const },
  { to: '/inbox', label: 'My Inbox', icon: Inbox, roles: ['REVIEWER'] as const },
  { to: '/users', label: 'Users', icon: Users, roles: ['TENANT_ADMIN', 'SUPER_ADMIN'] as const },
  { to: '/tenants', label: 'Tenants', icon: Building2, roles: ['TENANT_ADMIN', 'SUPER_ADMIN'] as const },
];

export function Sidebar() {
  const { user, hasRole } = useAuth();

  const visibleItems = navItems.filter((item) =>
    item.roles.some((role) => hasRole(role)),
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-6">
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

      <nav className="flex-1 space-y-1 p-4">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
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
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-brand-600">
              {user.role.replace('_', ' ')}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
