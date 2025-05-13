
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import Welcome from '@/pages/Welcome';
import Questionnaire from '@/pages/Questionnaire';
import Wardrobe from '@/pages/Wardrobe';
import Outfits from '@/pages/Outfits';
import Community from '@/pages/Community';
import Chats from '@/pages/Chats';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Navigation from '@/components/Navigation';
import '@/i18n/config';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!user.hasCompletedQuestionnaire) {
    return <Navigate to="/questionnaire" replace />;
  }

  return children;
};

function AppContent() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation(); 

  const showNavigation = !!(user && user.hasCompletedQuestionnaire);
  
  const isWelcomePage = location.pathname === '/';
  const isQuestionnairePage = location.pathname === '/questionnaire';

  let actualShowNavigation = showNavigation;
  if (isWelcomePage || isQuestionnairePage) {
    actualShowNavigation = false;
  }


  return (
    <div className="min-h-screen bg-[#E8EBEF]">
      <Toaster />
      {actualShowNavigation && <Navigation />}
      <div className={actualShowNavigation ? 'pb-20 md:pt-20 md:pb-0' : ''}>
        <Routes>
          <Route path="/" element={user ? (user.hasCompletedQuestionnaire ? <Navigate to="/wardrobe" replace /> : <Navigate to="/questionnaire" replace />) : <Welcome />} />
          <Route 
            path="/questionnaire" 
            element={
              user ? (
                user.hasCompletedQuestionnaire ? (
                  <Navigate to="/wardrobe" replace />
                ) : (
                  <Questionnaire />
                )
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/wardrobe" 
            element={
              <ProtectedRoute>
                <Wardrobe />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/community" 
            element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chats" 
            element={
              <ProtectedRoute>
                <Chats />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/outfits" 
            element={
              <ProtectedRoute>
                <Outfits />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth;
