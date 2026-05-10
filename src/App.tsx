import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { PageProvider } from './context/PageContext';
import { Auth } from './pages/Auth';
import { Builder } from './pages/Builder';
import { Admin } from './pages/Admin';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuthContext();
  if (loading) return null;
  if (!session) return <Navigate to="/sign-in" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { session, loading } = useAuthContext();
  if (loading) return null;

  return (
    <Routes>
      <Route
        path="/sign-in"
        element={session ? <Navigate to="/" replace /> : <Auth />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <PageProvider>
              <Builder />
            </PageProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <PageProvider>
              <Admin />
            </PageProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/:slug"
        element={<div>Public page — Phase 5</div>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
