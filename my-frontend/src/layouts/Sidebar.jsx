// src/layouts/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

// Added isDashboardEnabled as a prop to accept the feature flag from App.js
const Sidebar = ({ isDashboardEnabled = false }) => {
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(true);

    const styles = {
        sidebar: {
            width: '260px',
            minWidth: '260px', // Ensures sidebar stays exactly 260px
            flexShrink: 0,     // <--- MAGIC FIX 4: Prevents the wide table from squishing the sidebar
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 6px 0 rgba(67, 89, 113, 0.12)',
            zIndex: 10
        },
        // Adjusted bottom padding (changed to 5px) to close the gap
        brandWrapper: { padding: '20px 24px 5px 24px', display: 'flex', alignItems: 'center', fontSize: '22px', fontWeight: 'bold', color: '#566a7f', letterSpacing: '-0.5px', textDecoration: 'none' },
        brandLogo: { width: '100px', height: 'auto', marginRight: '10px' },
        menuList: { listStyle: 'none', padding: '0', margin: '0', flex: 1, overflowY: 'auto' },
        link: { textDecoration: 'none', display: 'block' },

        // UPDATED: Made bold, highlighted, colorful, and visually distinct matching logo colors (Blue/Green)
        sectionHeader: {
            fontSize: '12px',
            textTransform: 'uppercase',
            color: '#005bb5', // Vibrant blue matching the logo
            backgroundColor: '#e8f3fc', // Soft highlighted background
            padding: '8px 12px',
            borderRadius: '6px',
            margin: '10px 24px 16px 24px',
            letterSpacing: '0.5px',
            fontWeight: '900', // Made extra bold
            borderLeft: '4px solid #009a44' // Green accent from the logo
        },

        menuItem: (isActive) => ({
            margin: '0 16px 8px 16px', padding: '10px 16px',
            backgroundColor: isActive ? 'rgba(105, 108, 255, 0.16)' : 'transparent',
            color: isActive ? '#696cff' : '#697a8d',
            borderRadius: '6px', fontWeight: isActive ? '600' : '400',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', transition: 'all 0.2s'
        }),
        menuItemLeft: { display: 'flex', alignItems: 'center' },

        subMenuContainer: {
            overflow: 'hidden',
            transition: 'max-height 0.3s ease-in-out',
            maxHeight: isAccountMenuOpen ? '200px' : '0px'
        },
        subMenuItem: (isActive) => ({
            padding: '10px 16px 10px 48px',
            color: isActive ? '#696cff' : '#697a8d',
            fontWeight: isActive ? '600' : '400',
            display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s',
            position: 'relative'
        }),
        subMenuDot: (isActive) => ({
            width: '6px', height: '6px', borderRadius: '50%', marginRight: '10px',
            backgroundColor: isActive ? '#696cff' : '#d9dee3',
            boxShadow: isActive ? '0 0 0 3px rgba(105, 108, 255, 0.16)' : 'none',
            transition: 'all 0.2s'
        }),
        chevron: {
            transform: isAccountMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            fontSize: '12px'
        }
    };

    return (
        <aside style={styles.sidebar}>
            <div style={styles.brandWrapper}>
                <img src="/logo.png" alt="SHEVA ASHARM Logo" style={styles.brandLogo} /> SHEVA ASHARM
            </div>

            <ul style={styles.menuList}>
                {/* Separator text closer to the logo */}
                <li style={styles.sectionHeader}>Astha Didi Project</li>

                {/* Conditional rendering based on the flag */}
                {isDashboardEnabled && (
                    <NavLink to="/" style={styles.link}>
                        {({ isActive }) => (
                            <li style={styles.menuItem(isActive)}>
                                <div style={styles.menuItemLeft}>
                                    <span style={{ marginRight: '10px' }}>🏠</span> Dashboard
                                </div>
                            </li>
                        )}
                    </NavLink>
                )}

                <li style={styles.menuItem(false)} onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}>
                    <div style={styles.menuItemLeft}>
                        {/* Profile icon added here */}
                        <span style={{ marginRight: '10px' }}>👤</span>  Profile Section
                    </div>
                    <span style={styles.chevron}>▶</span>
                </li>

                <div style={styles.subMenuContainer}>
                    <NavLink to="/account-settings/account" style={styles.link}>
                        {({ isActive }) => (
                            <li style={styles.subMenuItem(isActive)}>
                                <div style={styles.subMenuDot(isActive)}></div> Profile Entry
                            </li>
                        )}
                    </NavLink>
                </div>
            </ul>
        </aside>
    );
};

export default Sidebar;