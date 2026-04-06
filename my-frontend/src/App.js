// src/App.js
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './layouts/Sidebar';
import Navbar from './layouts/Navbar';
import Dashboard from './pages/Dashboard';
import Maintenance from './pages/Maintenance';
import AccountSettings from './pages/AccountSettings';
import Login from './pages/Login';

const App = () => {
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
      minWidth: 0, // <--- MAGIC FIX 1: Stops the right side from growing past the screen
    },
    contentArea: {
      padding: '0 24px 24px 24px',
      overflowY: 'auto',
      overflowX: 'hidden', // <--- MAGIC FIX 2: Hides the master horizontal scrollbar
      flex: 1,
      minWidth: 0, // <--- MAGIC FIX 3: Forces the inner content to stay within bounds
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login onLogin={() => setIsAuthenticated(true)} />}
        />

        <Route path="*" element={
          isAuthenticated ? (
            <div style={styles.appContainer}>
              <Sidebar />
              <div style={styles.mainContent}>
                <Navbar />
                <div style={styles.contentArea}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/layouts" element={<Maintenance pageName="Layouts" />} />
                    <Route path="/account-settings/account" element={<AccountSettings />} />
                    <Route path="*" element={<Maintenance pageName="404 Not Found" />} />
                  </Routes>
                </div>
              </div>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;