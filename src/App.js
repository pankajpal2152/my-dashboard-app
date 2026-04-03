// src/App.js
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './layouts/Sidebar';
import Navbar from './layouts/Navbar';
import Dashboard from './pages/Dashboard';
import Maintenance from './pages/Maintenance';
import AccountSettings from './pages/AccountSettings';
import Login from './pages/Login'; // Import the new login page

const App = () => {
  // Dummy authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const styles = {
    appContainer: {
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#f5f5f9',
      fontFamily: '"Public Sans", sans-serif',
      color: '#697a8d'
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    },
    contentArea: {
      padding: '0 24px 24px 24px',
      overflowY: 'auto',
      flex: 1
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Unauthenticated Route: Only shows the Login card */}
        <Route
          path="/login"
          element={<Login onLogin={() => setIsAuthenticated(true)} />}
        />

        {/* Authenticated Routes: Wrapped inside your layout structure */}
        <Route path="*" element={
          isAuthenticated ? (
            <div style={styles.appContainer}>
              <Sidebar />
              <div style={styles.mainContent}>
                <Navbar />
                <div style={styles.contentArea}>
                  <Routes>
                    {/* Dashboard handles the "/" path */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/layouts" element={<Maintenance pageName="Layouts" />} />
                    <Route path="/account-settings/account" element={<AccountSettings />} />
                    <Route path="*" element={<Maintenance pageName="404 Not Found" />} />
                  </Routes>
                </div>
              </div>
            </div>
          ) : (
            /* Redirect to login if user tries to access any page while logged out */
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;