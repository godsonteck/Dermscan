import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import ProtectedRoute from './components/ProtectedRoute.js';
import Navbar from './components/Navbar.js';
import { Toaster } from 'react-hot-toast';

// Import Pages
import LandingPage from './pages/LandingPage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
import DashboardPage from './pages/DashboardPage.js';
import NewScanPage from './pages/NewScanPage.js';
import ScanResultPage from './pages/ScanResultPage.js';
import HistoryPage from './pages/HistoryPage.js';
import ProfilePage from './pages/ProfilePage.js';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="bg-transparent min-h-screen text-slate-100 flex flex-col font-sans select-none antialiased">
          {/* Top Sticky Navigation */}
          <Navbar />

          {/* Core Route Layout */}
          <main className="flex-1">
            <Routes>
              {/* Public Views */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Private Protected Views */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scan/new"
                element={
                  <ProtectedRoute>
                    <NewScanPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scan/:id"
                element={
                  <ProtectedRoute>
                    <ScanResultPage />
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
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all fallback navigation */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Action Popups Notification Toaster */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#111118',
                color: '#f8fafc',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '12px',
                fontWeight: '600',
                fontFamily: 'Plus Jakarta Sans',
                borderRadius: '12px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#111118',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#111118',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
