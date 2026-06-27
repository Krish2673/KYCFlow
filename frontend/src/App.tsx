import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { CreateApplicationPage } from './pages/CreateApplicationPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';
import { ReviewerInboxPage } from './pages/ReviewerInboxPage';
import { UsersPage } from './pages/UsersPage';
import { TenantsPage } from './pages/TenantsPage';
import { RiskAssessmentPage } from './pages/RiskAssessmentPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />

                <Route element={<ProtectedRoute roles={['TENANT_ADMIN', 'SUPER_ADMIN']} />}>
                  <Route path="/applications" element={<ApplicationsPage />} />
                  <Route path="/applications/new" element={<CreateApplicationPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/tenants" element={<TenantsPage />} />
                </Route>

                <Route element={<ProtectedRoute roles={['REVIEWER', 'TENANT_ADMIN', 'SUPER_ADMIN']} />}>
                  <Route path="/inbox" element={<ReviewerInboxPage />} />
                </Route>

                <Route path="/applications/:id/risk" element={<RiskAssessmentPage />} />
                <Route path="/applications/:id" element={<ApplicationDetailPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
