// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- SHARED STYLES ---
const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f9', fontFamily: '"Public Sans", sans-serif', position: 'relative', overflow: 'hidden' },
    card: { backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 6px 0 rgba(67, 89, 113, 0.12)', padding: '40px', width: '100%', maxWidth: '400px', zIndex: 1 },
    logoContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px', gap: '8px' },
    logoImage: { maxHeight: '100px', objectFit: 'contain' },
    welcomeText: { fontSize: '1.25rem', fontWeight: '500', color: '#566a7f', marginBottom: '8px', marginTop: 0 },
    subText: { fontSize: '0.9375rem', color: '#697a8d', marginBottom: '24px', lineHeight: '1.5' },
    formGroup: { marginBottom: '16px' },
    labelContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    label: { fontSize: '0.75rem', fontWeight: '600', color: '#566a7f', textTransform: 'uppercase', letterSpacing: '0.25px' },
    linkText: { fontSize: '0.8125rem', color: '#696cff', textDecoration: 'none', cursor: 'pointer' },
    input: { width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d9dee3', fontSize: '0.9375rem', color: '#697a8d', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s', backgroundColor: '#fff' },
    passwordContainer: { position: 'relative', display: 'flex', alignItems: 'center' },
    eyeIcon: { position: 'absolute', right: '14px', cursor: 'pointer', color: '#a1acb8', backgroundColor: 'transparent', border: 'none', padding: 0, display: 'flex' },
    checkboxContainer: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' },
    checkbox: { width: '16px', height: '16px', cursor: 'pointer' },
    checkboxLabel: { fontSize: '0.9375rem', color: '#697a8d', cursor: 'pointer' },
    submitBtn: { width: '100%', backgroundColor: '#696cff', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9375rem', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s', marginBottom: '16px' },
    footerText: { textAlign: 'center', fontSize: '0.9375rem', color: '#697a8d', margin: 0 },
    footerLink: { color: '#696cff', textDecoration: 'none', cursor: 'pointer' }
};

// --- 1. LOGIN COMPONENT ---
const LoginForm = ({ onLogin, onToggleView }) => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [credentials, setCredentials] = useState({ email: '', password: '' });

    const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!credentials.email || !credentials.password) {
            alert("Please enter both email and password.");
            return;
        }

        try {
            const response = await fetch('https://my-dashboard-app-ky8v.onrender.com/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('loggedInUser', JSON.stringify(data.user));
                alert(`Login Successful! Welcome, ${data.user.username}`);
                onLogin();
                navigate('/');
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error("Login failed:", error);
            alert("Failed to connect to the server.");
        }
    };

    return (
        <div style={styles.card}>
            <div style={styles.logoContainer}>
                <img src="/logo.png" alt="App Logo" style={styles.logoImage} />
            </div>
            <h3 style={styles.welcomeText}>Welcome! 👋</h3>
            <p style={styles.subText}>Please sign in to your account and join the Astha Didi Project</p>

            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <div style={styles.labelContainer}>
                        <label htmlFor="email" style={styles.label}>Email Address</label>
                    </div>
                    <input type="email" id="email" name="email" placeholder="Enter your email" style={styles.input} value={credentials.email} onChange={handleChange} autoFocus />
                </div>

                <div style={styles.formGroup}>
                    <div style={styles.labelContainer}>
                        <label htmlFor="password" style={styles.label}>Password</label>
                        {/* <span style={styles.linkText}>Forgot Password?</span> */}
                    </div>
                    <div style={styles.passwordContainer}>
                        <input type={showPassword ? "text" : "password"} id="password" name="password" placeholder="············" style={styles.input} value={credentials.password} onChange={handleChange} />
                        <button type="button" style={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            )}
                        </button>
                    </div>
                </div>

                <button type="submit" style={styles.submitBtn} onMouseOver={(e) => e.target.style.backgroundColor = '#5f61e6'} onMouseOut={(e) => e.target.style.backgroundColor = '#696cff'}>
                    Sign in
                </button>
            </form>

            <p style={styles.footerText}>
                New on our platform? <span onClick={onToggleView} style={styles.footerLink}>Create an account</span>
            </p>
        </div>
    );
};

// --- 2. SIGNUP COMPONENT ---
const SignupForm = ({ onSignup, onToggleView }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [roles, setRoles] = useState([]);
    const [credentials, setCredentials] = useState({ role: '', username: '', email: '', password: '' });

    // Fetch Roles dynamically from database userinfo table
    // Fetch Roles dynamically from database userinfo table
    useEffect(() => {
        fetch('https://my-dashboard-app-ky8v.onrender.com/userinfo')
            .then(res => res.json())
            .then(data => {
                // NEW CODE: Filter the roles to ONLY include 'Astha Didi'
                const filteredRoles = data.filter(role => role.UserType === 'Astha Didi');

                // Set only the filtered list into the state
                setRoles(filteredRoles);
            })
            .catch(err => console.error("Error fetching roles: ", err));
    }, []);

    const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!credentials.role || !credentials.username || !credentials.email || !credentials.password) {
            alert("Please fill in all fields and select a role to sign up.");
            return;
        }

        try {
            const response = await fetch('https://my-dashboard-app-ky8v.onrender.com/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Account created successfully! You can now log in.");
                onToggleView();
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error("Signup failed:", error);
            alert("Failed to connect to the server.");
        }
    };

    return (
        <div style={styles.card}>
            <div style={styles.logoContainer}>
                <img src="/logo.png" alt="App Logo" style={styles.logoImage} />
            </div>
            <h3 style={styles.welcomeText}>Astha Didi Project</h3>
            {/* <p style={styles.subText}>Astha Didi Project</p> */}

            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label htmlFor="role" style={styles.label}>Select Role</label>
                    <select
                        id="role"
                        name="role"
                        style={{ ...styles.input, marginTop: '8px', paddingRight: '30px', cursor: 'pointer' }}
                        value={credentials.role}
                        onChange={handleChange}
                    >
                        <option value="" disabled>Select your role...</option>
                        {roles.length > 0 ? (
                            roles.map((r) => (
                                <option key={r.UserInfoId} value={r.UserType}>{r.UserType}</option>
                            ))
                        ) : (
                            // Fallback if network is slow
                            <>
                                <option value="State Super Administrator">State Super Administrator</option>
                                <option value="District Administrator">District Administrator</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="Astha Didi">Astha Didi</option>
                            </>
                        )}
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label htmlFor="username" style={styles.label}>Username</label>
                    <input type="text" id="username" name="username" placeholder="Enter your username" style={{ ...styles.input, marginTop: '8px' }} value={credentials.username} onChange={handleChange} />
                </div>

                <div style={styles.formGroup}>
                    <label htmlFor="email" style={styles.label}>Email</label>
                    <input type="email" id="email" name="email" placeholder="Enter your email" style={{ ...styles.input, marginTop: '8px' }} value={credentials.email} onChange={handleChange} />
                </div>

                <div style={styles.formGroup}>
                    <label htmlFor="password" style={styles.label}>Password</label>
                    <div style={{ ...styles.passwordContainer, marginTop: '8px' }}>
                        <input type={showPassword ? "text" : "password"} id="password" name="password" placeholder="············" style={styles.input} value={credentials.password} onChange={handleChange} />
                        <button type="button" style={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            )}
                        </button>
                    </div>
                </div>

                <div style={styles.checkboxContainer}>
                    <input type="checkbox" id="terms" style={styles.checkbox} required />
                    <label htmlFor="terms" style={styles.checkboxLabel}>
                        I agree to <span style={styles.linkText}>privacy policy & terms</span>
                    </label>
                </div>

                <button type="submit" style={styles.submitBtn} onMouseOver={(e) => e.target.style.backgroundColor = '#5f61e6'} onMouseOut={(e) => e.target.style.backgroundColor = '#696cff'}>
                    Sign up
                </button>
            </form>

            <p style={styles.footerText}>
                Already have an account? <span onClick={onToggleView} style={styles.footerLink}>Sign in instead</span>
            </p>
        </div>
    );
};

// --- MAIN WRAPPER CONTAINER ---
const Login = ({ onLogin }) => {
    const [isLoginView, setIsLoginView] = useState(true);

    return (
        <div style={styles.container}>
            {isLoginView ? (
                <LoginForm onLogin={onLogin} onToggleView={() => setIsLoginView(false)} />
            ) : (
                <SignupForm onSignup={onLogin} onToggleView={() => setIsLoginView(true)} />
            )}
        </div>
    );
};

export default Login;