import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './stores/authStore';

// Pages
import LandingPage    from './pages/LandingPage';
import AuthPage       from './pages/AuthPage';
import DashboardPage  from './pages/DashboardPage';
import TasksPage      from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import FlashcardsPage from './pages/FlashcardsPage';
import DeckReviewPage from './pages/DeckReviewPage';
import ChatPage       from './pages/ChatPage';
import ProfilePage    from './pages/ProfilePage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout         from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { initAuth, loading, user } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe?.();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1f2937',
            borderRadius: '1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
        />
        <Route
          path="/auth"
          element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
        />

        {/* Protected routes — all wrapped in Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout><DashboardPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Layout><TasksPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute>
              <Layout><TaskDetailPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/flashcards"
          element={
            <ProtectedRoute>
              <Layout><FlashcardsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/flashcards/:deckId"
          element={
            <ProtectedRoute>
              <Layout><DeckReviewPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Layout><ChatPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout><ProfilePage /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
