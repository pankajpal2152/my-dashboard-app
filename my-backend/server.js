// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();

// Middleware to parse JSON and allow connections from React
app.use(cors());
app.use(express.json());

// Set up MySQL connection (Default XAMPP credentials)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // XAMPP default user is 'root'
    password: '',      // XAMPP default password is empty
    database: 'auth_db'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

// --- SIGNUP ROUTE ---
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // 1. Check if user already exists
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (results.length > 0) return res.status(400).json({ error: 'Email already exists' });

            // 2. Encrypt the password before saving
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 3. Save user to database
            const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
                if (err) return res.status(500).json({ error: 'Failed to register user' });
                res.status(201).json({ message: 'User registered successfully!' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// --- LOGIN ROUTE ---
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // 1. Find user by email
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(400).json({ error: 'User not found' });

        const user = results[0];

        // 2. Compare the provided password with the encrypted password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect password' });
        }

        // 3. Success!
        res.status(200).json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email } });
    });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
});