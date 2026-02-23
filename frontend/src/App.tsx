import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SubjectPage } from '@/pages/SubjectPage';
import { AskPage } from '@/pages/AskPage';
import { AnswerPage } from '@/pages/AnswerPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ApiKeyGuidePage } from '@/pages/ApiKeyGuidePage';
import { SyllabusPage } from '@/pages/SyllabusPage';
import { StudyMaterialPage } from '@/pages/StudyMaterialPage';
import { AlphaStatusPage } from '@/pages/AlphaStatusPage';

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Public route component (redirects to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const { isDark } = useThemeStore();

  // Initialize dark mode on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDark ? '#1c1c1e' : '#ffffff',
            color: isDark ? '#ffffff' : '#1c1c1e',
            border: `1px solid ${isDark ? '#3a3a3c' : '#e5e5ea'}`,
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#34C759',
              secondary: isDark ? '#1c1c1e' : '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF3B30',
              secondary: isDark ? '#1c1c1e' : '#ffffff',
            },
          },
        }}
      />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subject/:subjectId"
          element={
            <ProtectedRoute>
              <SubjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ask"
          element={
            <ProtectedRoute>
              <AskPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/answer/:questionId"
          element={
            <ProtectedRoute>
              <AnswerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/api-key-guide"
          element={
            <ProtectedRoute>
              <ApiKeyGuidePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/syllabus"
          element={
            <ProtectedRoute>
              <SyllabusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study-materials"
          element={
            <ProtectedRoute>
              <StudyMaterialPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alpha-status"
          element={
            <ProtectedRoute>
              <AlphaStatusPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
