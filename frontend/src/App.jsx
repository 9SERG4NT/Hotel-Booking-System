import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Import pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import HotelDetails from './pages/HotelDetails.jsx';
import BookingConfirmation from './pages/BookingConfirmation.jsx';

// Import CSS
import './index.css';

// Layout component with navigation
const Layout = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <h1>
            <a href="/" style={{ textDecoration: 'none', color: '#007bff' }}>
              HotelBooking
            </a>
          </h1>
          <ul className="nav-links">
            <li><a href="/">Home</a></li>
            {isAuthenticated ? (
              <>
                <li>
                  <a href="/dashboard">
                    {user?.name}
                    {user?.role === 'admin' && ' (Admin)'}
                  </a>
                </li>
                <li>
                  <button onClick={logout} className="btn btn-sm btn-secondary">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><a href="/login" className="btn btn-sm btn-outline">Login</a></li>
                <li><a href="/signup" className="btn btn-sm btn-primary">Sign Up</a></li>
              </>
            )}
          </ul>
        </div>
      </nav>
      <main>
        {children}
      </main>
    </>
  );
};

// App component with Layout wrapper
const AppWithLayout = () => {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/hotel/:id"
              element={
                <ProtectedRoute>
                  <HotelDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/booking/:hotelId/:roomId"
              element={
                <ProtectedRoute>
                  <BookingConfirmation />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
};

export default AppWithLayout;