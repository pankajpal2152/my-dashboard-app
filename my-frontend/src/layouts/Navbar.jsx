// src/layouts/Navbar.jsx
import React from 'react';

const Navbar = () => {
    const styles = {
        navbarContainer: {
            height: '64px',
            backgroundColor: '#ffffff',
            margin: '16px 24px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            boxShadow: '0 2px 6px 0 rgba(67, 89, 113, 0.12)'
        },
        searchWrapper: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        searchInput: {
            border: 'none',
            outline: 'none',
            fontSize: '15px',
            color: '#697a8d',
            width: '250px',
            backgroundColor: 'transparent'
        },
        rightControls: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        },
        githubBadge: {
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #d9dee3',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#697a8d',
            fontWeight: '500'
        },
        avatar: {
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#e1e4e8', // Placeholder for user image
            border: '2px solid #fff',
            boxShadow: '0 0 0 1px #d9dee3',
            position: 'relative'
        },
        onlineIndicator: {
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: '10px',
            height: '10px',
            backgroundColor: '#71dd37', // Success green
            borderRadius: '50%',
            border: '2px solid #fff'
        }
    };

    return (
        <nav style={styles.navbarContainer}>
            <div style={styles.searchWrapper}>
                <span style={{ color: '#697a8d', fontSize: '18px' }}>🔍</span>
                <input type="text" placeholder="Search..." style={styles.searchInput} />
            </div>

            <div style={styles.rightControls}>
                <div style={styles.githubBadge}>
                    <span style={{ marginRight: '6px' }}>⭐</span> Star 1,199
                </div>
                <div style={styles.avatar}>
                    {/* Placeholder for the face image in the design */}
                    <div style={styles.onlineIndicator}></div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;