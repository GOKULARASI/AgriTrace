import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TraceProduct from './pages/TraceProduct';
import QRScanner from './pages/QRScanner';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import { useContext } from 'react';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Dashboard Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
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
                <ProtectedRoute allowedRoles={['Admin']}>
                  <Settings />
                </ProtectedRoute>
              } 
            />

            {/* Public/Hybrid Routes wrapped in Layout for consistent feel if logged in */}
            <Route 
              path="/scan" 
              element={
                <AuthContext.Consumer>
                  {({ user }) => (
                    user ? <Layout><QRScanner /></Layout> : <QRScanner />
                  )}
                </AuthContext.Consumer>
              } 
            />
            <Route 
              path="/trace/:batchId" 
              element={
                <AuthContext.Consumer>
                  {({ user }) => (
                    user ? <Layout><TraceProduct /></Layout> : <TraceProduct />
                  )}
                </AuthContext.Consumer>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
