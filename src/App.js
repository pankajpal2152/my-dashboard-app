// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './layouts/Sidebar';
import Navbar from './layouts/Navbar';
import Dashboard from './pages/Dashboard';
import Maintenance from './pages/Maintenance';

const App = () => {
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
      <div style={styles.appContainer}>
        <Sidebar />

        <div style={styles.mainContent}>
          <Navbar />

          <div style={styles.contentArea}>
            <Routes>
              {/* This shows the Dashboard when URL is "/" */}
              <Route path="/" element={<Dashboard />} />

              {/* These show the Maintenance page for other paths */}
              <Route path="/layouts" element={<Maintenance pageName="Layouts" />} />
              <Route path="/account-settings" element={<Maintenance pageName="Account Settings" />} />

              {/* Fallback for any other URL */}
              <Route path="*" element={<Maintenance pageName="404 Not Found" />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;