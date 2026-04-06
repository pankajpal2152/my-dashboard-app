// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();

// Allow requests from anywhere (Vercel)
app.use(cors({ origin: '*' }));
app.use(express.json());

// Set up MySQL connection using Environment Variables and SSL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false // CRITICAL: Aiven requires SSL to connect!
    }
});

// Connect to the cloud database and auto-create the table
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to Cloud MySQL database.');

    // Automatically create the users table if it doesn't exist!
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
        )
    `;
    db.query(createTableQuery, (err, result) => {
        if (err) console.error("Error creating table: ", err);
        else console.log("Users table is ready!");
    });
});

// --- SIGNUP ROUTE (Your existing code) ---
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (results.length > 0) return res.status(400).json({ error: 'Email already exists' });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

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

// --- LOGIN ROUTE (Your existing code) ---
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(400).json({ error: 'User not found' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect password' });
        }
        res.status(200).json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email } });
    });
});


// =================================================================
// --- CLIENT PROVIDED CRUD ROUTES (Adapted for your Database) ---
// =================================================================

// Get all users
app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Get a user by ID
app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
});

// Create a new user (Adapted to hash password so they can log in via React)
app.post('/users', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err, result) => {
            if (err) throw err;
            res.json({ message: 'User added successfully', id: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a user (Adapted to hash the new password)
app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { email, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        db.query('UPDATE users SET email = ?, password = ? WHERE id = ?', [email, hashedPassword, id], (err) => {
            if (err) throw err;
            res.json({ message: 'User updated successfully' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a user
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) throw err;
        res.json({ message: 'User deleted successfully' });
    });
});

// =================================================================

// Use dynamic port for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
});