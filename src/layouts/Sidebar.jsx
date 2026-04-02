// src/layouts/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const styles = {
        sidebar: {
            width: '260px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 6px 0 rgba(67, 89, 113, 0.12)',
            zIndex: 10
        },
        brandWrapper: {
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '22px',
            fontWeight: 'bold',
            color: '#566a7f',
            letterSpacing: '-0.5px',
            textDecoration: 'none'
        },
        brandIcon: { color: '#696cff', marginRight: '10px', fontSize: '28px' },
        menuList: { listStyle: 'none', padding: '0', margin: '0', flex: 1, overflowY: 'auto' },
        link: { textDecoration: 'none', display: 'block' },
        // Function to handle dynamic active styling
        menuItem: (isActive) => ({
            margin: '0 16px 8px 16px',
            padding: '10px 16px',
            backgroundColor: isActive ? 'rgba(105, 108, 255, 0.16)' : 'transparent',
            color: isActive ? '#696cff' : '#697a8d',
            borderRadius: '6px',
            fontWeight: isActive ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
        })
    };

    return (
        <aside style={styles.sidebar}>
            <div style={styles.brandWrapper}>
                <span style={styles.brandIcon}>S</span> sneat
            </div>

            <ul style={styles.menuList}>
                {/* DASHBOARD LINK */}
                <NavLink to="/" style={styles.link}>
                    {({ isActive }) => (
                        <li style={styles.menuItem(isActive)}>
                            <span style={{ marginRight: '10px' }}>🏠</span> Dashboard
                        </li>
                    )}
                </NavLink>

                {/* LAYOUTS LINK */}
                {/* <NavLink to="/layouts" style={styles.link}>
                    {({ isActive }) => (
                        <li style={styles.menuItem(isActive)}>
                            <span style={{ marginRight: '10px' }}>◫</span> Layouts
                        </li>
                    )}
                </NavLink> */}

                {/* <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#a1acb8', margin: '16px 24px 8px 24px' }}>Pages</div> */}

                {/* <NavLink to="/account-settings" style={styles.link}>
                    {({ isActive }) => (
                        <li style={styles.menuItem(isActive)}>👤 Account Settings</li>
                    )}
                </NavLink> */}
            </ul>
        </aside>
    );
};

export default Sidebar;