// server.js
require('dotenv').config();
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

// Connect to the cloud database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to Cloud MySQL database.');

    // Auto-create original users table
    db.query(`CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL)`);

    // Auto-create Client's reginfo table
    const createRegInfoTable = `
        CREATE TABLE IF NOT EXISTS reginfo (
            RegInfoId int(11) NOT NULL AUTO_INCREMENT,
            PerName varchar(30) DEFAULT NULL, FathersName varchar(30) DEFAULT NULL,
            DOB date DEFAULT NULL, NomineeName varchar(50) DEFAULT NULL,
            StateId int(11) DEFAULT NULL, DistId int(11) DEFAULT NULL,
            BlockName varchar(30) DEFAULT NULL, PO varchar(50) DEFAULT NULL,
            PS varchar(30) DEFAULT NULL, Village varchar(50) DEFAULT NULL,
            Pincode int(11) DEFAULT NULL, ContactNo varchar(12) DEFAULT NULL,
            MailId varchar(50) DEFAULT NULL, BankName varchar(30) DEFAULT NULL,
            BranchName varchar(30) DEFAULT NULL, AcctNo varchar(30) DEFAULT NULL,
            IFSCode varchar(15) DEFAULT NULL, PanNo varchar(20) DEFAULT NULL,
            AadharNo varchar(15) DEFAULT NULL, JoiningAmt int(11) DEFAULT NULL,
            WalletBalance int(11) DEFAULT NULL, ActStatus int(1) DEFAULT 1,
            PRIMARY KEY (RegInfoId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    db.query(createRegInfoTable, (err) => {
        if (err) console.error("Error creating reginfo table: ", err);
        else console.log("reginfo table is ready!");
    });
});

// ==========================================
// 1. ORIGINAL LOGIN & SIGNUP ROUTES
// ==========================================
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (results.length > 0) return res.status(400).json({ error: 'Email already exists' });
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err, result) => {
                if (err) return res.status(500).json({ error: 'Failed to register' });
                res.status(201).json({ message: 'User registered successfully!' });
            });
        });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(400).json({ error: 'User not found' });
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });
        res.status(200).json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email } });
    });
});

// ==========================================
// 2. CLIENT REGINFO API (AccountTab Form)
// ==========================================
app.get('/RegInfo', (req, res) => {
    db.query('SELECT * FROM reginfo', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/RegInfo/:RegInfoId', (req, res) => {
    const { RegInfoId } = req.params;
    db.query('SELECT * FROM reginfo WHERE RegInfoId= ?', [RegInfoId], (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
});

app.post('/RegInfo', (req, res) => {
    const { PerName, FathersName, DOB, NomineeName, StateId, DistId, BlockName, PO, PS, Village, Pincode, ContactNo, MailId, BankName, BranchName, AcctNo, IFSCode, PanNo, AadharNo, JoiningAmt, WalletBalance, ActStatus } = req.body;
    const insertQuery = 'INSERT INTO reginfo (PerName,FathersName,DOB,NomineeName,StateId,DistId,BlockName,PO,PS,Village,Pincode,ContactNo,MailId,BankName,BranchName,AcctNo,IFSCode,PanNo,AadharNo,JoiningAmt,WalletBalance,ActStatus) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

    db.query(insertQuery, [PerName, FathersName, DOB, NomineeName, StateId, DistId, BlockName, PO, PS, Village, Pincode, ContactNo, MailId, BankName, BranchName, AcctNo, IFSCode, PanNo, AadharNo, JoiningAmt, WalletBalance, ActStatus], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User added successfully', id: result.insertId });
    });
});

app.put('/RegInfo/:RegInfoId', (req, res) => {
    const { RegInfoId } = req.params;
    const { PerName, FathersName, DOB, NomineeName, StateId, DistId, BlockName, PO, PS, Village, Pincode, ContactNo, MailId, BankName, BranchName, AcctNo, IFSCode, PanNo, AadharNo, JoiningAmt, WalletBalance, ActStatus } = req.body;
    const updateQuery = 'UPDATE reginfo SET PerName=?, FathersName=?, DOB=?, NomineeName=?, StateId=?, DistId=?, BlockName=?, PO=?, PS=?, Village=?, Pincode=?, ContactNo=?, MailId=?, BankName=?, BranchName=?, AcctNo=?, IFSCode=?, PanNo=?, AadharNo=?, JoiningAmt=?, WalletBalance=?, ActStatus=? WHERE RegInfoId=?';

    db.query(updateQuery, [PerName, FathersName, DOB, NomineeName, StateId, DistId, BlockName, PO, PS, Village, Pincode, ContactNo, MailId, BankName, BranchName, AcctNo, IFSCode, PanNo, AadharNo, JoiningAmt, WalletBalance, ActStatus, RegInfoId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User updated successfully' });
    });
});

app.delete('/RegInfo/:RegInfoId', (req, res) => {
    const { RegInfoId } = req.params;
    db.query('DELETE FROM reginfo WHERE RegInfoId = ?', [RegInfoId], (err) => {
        if (err) throw err;
        res.json({ message: 'User deleted successfully' });
    });
});

// ==========================================
// 3. CLIENT USERSREGINFO API
// ==========================================
app.get('/usersreginfo', (req, res) => {
    db.query('SELECT * FROM usersreginfo', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/usersreginfo', (req, res) => {
    const { UsersRole, UsersRegName, UsersRegMailId, UsersRegPassword } = req.body;
    db.query('INSERT INTO usersreginfo (UsersRole,UsersRegName,UsersRegMailId,UsersRegPassword) VALUES (?, ?, ?, ?)', [UsersRole, UsersRegName, UsersRegMailId, UsersRegPassword], (err, result) => {
        if (err) throw err;
        res.json({ message: 'User added successfully', UsersRegId: result.insertId });
    });
});

// Use dynamic port for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
});