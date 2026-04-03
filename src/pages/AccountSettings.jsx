// src/pages/AccountSettings.jsx
import React from 'react';
import AccountTab from '../components/AccountTab';

const AccountSettings = () => {
    const styles = {
        container: { display: 'flex', flexDirection: 'column', gap: '24px' },
        breadcrumb: {
            fontSize: '1.25rem', fontWeight: '400', color: '#a1acb8', margin: '0 0 10px 0', fontFamily: '"Public Sans", sans-serif'
        },
        breadcrumbActive: { fontWeight: '600', color: '#566a7f' },
        tabsContainer: { display: 'flex', gap: '8px' },
        tab: (isActive) => ({
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '6px', cursor: 'pointer',
            backgroundColor: isActive ? '#696cff' : 'transparent',
            color: isActive ? '#ffffff' : '#697a8d',
            fontWeight: '500', fontSize: '0.9375rem', transition: 'all 0.2s', border: 'none', outline: 'none'
        })
    };

    return (
        <div style={styles.container}>
            {/* Page Title */}
            <h4 style={styles.breadcrumb}>
                Account Settings / <span style={styles.breadcrumbActive}>Account</span>
            </h4>

            {/* Navigation Tabs */}
            <div style={styles.tabsContainer}>
                <button style={styles.tab(true)}>
                    <span style={{ fontSize: '18px' }}>👤</span> Account
                </button>
                <button style={styles.tab(false)}>
                    <span style={{ fontSize: '18px' }}>🔔</span> Notifications
                </button>
                <button style={styles.tab(false)}>
                    <span style={{ fontSize: '18px' }}>🔗</span> Connections
                </button>
            </div>

            {/* Main Content Area */}
            <AccountTab />

        </div>
    );
};

export default AccountSettings;