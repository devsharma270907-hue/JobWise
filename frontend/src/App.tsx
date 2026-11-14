import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthProvider';
import { ThemeProvider } from './lib/theme/ThemeProvider';
import { RequireAuth } from './auth/RequireAuth';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { JobFeedPage } from './features/jobs/JobFeedPage';
import { KanbanBoardPage } from './features/applications/KanbanBoardPage';
import { ResumePage } from './features/resume/ResumePage';
import { InterviewStudioPage } from './features/interviewPrep/InterviewStudioPage';
import { SkillGapsPage } from './features/skillGaps/SkillGapsPage';
import { FreelanceGigsPage } from './features/freelance/FreelanceGigsPage';
import { SettingsPage } from './features/settings/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Application Shell */}
            <Route
              element={
                <RequireAuth>
                  <ErrorBoundary>
                    <AppLayout />
                  </ErrorBoundary>
                </RequireAuth>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/jobs" element={<JobFeedPage />} />
              <Route path="/applications" element={<KanbanBoardPage />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/interview-prep" element={<InterviewStudioPage />} />
              <Route path="/skill-gaps" element={<SkillGapsPage />} />
              <Route path="/freelance" element={<FreelanceGigsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Root & Catch-all redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
