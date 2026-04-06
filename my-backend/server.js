// server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();

// Allow requests from anywhere (Vercel)
app.use(cors({ origin: '*' }));
// Increase payload limit to allow large image base64 strings
app.use(express.json({ limit: '10mb' }));

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

    // 1. Auto-create users table
    db.query(`CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, role VARCHAR(100) NOT NULL, username VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL)`);

    // 2. Add 'role' column to users if missing
    db.query("ALTER TABLE users ADD COLUMN role VARCHAR(100) DEFAULT 'State Super Administrator' AFTER id", () => { });

    // 3. Auto-create userinfo table
    const createUserInfoTable = `
        CREATE TABLE IF NOT EXISTS userinfo (
          UserInfoId int(11) NOT NULL AUTO_INCREMENT,
          UserType varchar(50) DEFAULT NULL,
          UserRole varchar(20) DEFAULT NULL,
          ActStatus int(1) DEFAULT 1,
          PRIMARY KEY (UserInfoId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    db.query(createUserInfoTable, (err) => {
        if (!err) {
            db.query('SELECT COUNT(*) AS count FROM userinfo', (err, rows) => {
                if (!err && rows[0].count === 0) {
                    const insertUsers = `INSERT INTO userinfo(UserType,UserRole,ActStatus) VALUES 
                    ('State Super Administrator','Admin',1),
                    ('District Administrator','Admin',1),
                    ('Supervisor','General',1),
                    ('Astha Didi','General',1)`;
                    db.query(insertUsers);
                    console.log("Inserted default roles into userinfo.");
                }
            });
        }
    });

    // 4. Auto-create Client's reginfo table
    const createRegInfoTable = `
        CREATE TABLE IF NOT EXISTS reginfo (
            RegInfoId int(11) NOT NULL AUTO_INCREMENT,
            ProfileImage LONGTEXT DEFAULT NULL,
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
            WalletBalance int(11) DEFAULT NULL, Status int(1) DEFAULT 1,
            AprovedBy int(11) DEFAULT NULL, AprovalDate date DEFAULT NULL,
            AprovalNumber int(11) DEFAULT NULL,
            PRIMARY KEY (RegInfoId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    db.query(createRegInfoTable, () => { });

    // 5. MAGIC FIX: Automatically add the 'ProfileImage' column to your existing live table!
    db.query("ALTER TABLE reginfo ADD COLUMN ProfileImage LONGTEXT DEFAULT NULL AFTER RegInfoId", (err) => {
        if (!err) console.log("Successfully added missing 'ProfileImage' column to existing reginfo table!");
    });
});

// ==========================================
// 1. AUTHENTICATION (LOGIN & SIGNUP WITH ROLE)
// ==========================================
app.post('/signup', async (req, res) => {
    const { role, username, email, password } = req.body;
    try {
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (results.length > 0) return res.status(400).json({ error: 'Email already exists' });
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            db.query('INSERT INTO users (role, username, email, password) VALUES (?, ?, ?, ?)', [role, username, email, hashedPassword], (err, result) => {
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
        res.status(200).json({ message: 'Login successful', user: { id: user.id, role: user.role, username: user.username, email: user.email } });
    });
});

// ==========================================
// 2. CLIENT USERINFO API (For Dropdowns)
// ==========================================
app.get('/userinfo', (req, res) => {
    db.query('SELECT * FROM userinfo WHERE ActStatus = 1', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ==========================================
// 3. CLIENT REGINFO API
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
    const { ProfileImage, PerName, FathersName, DOB, NomineeName, StateId, DistId, BlockName, PO, PS, Village, Pincode, ContactNo, MailId, BankName, BranchName, AcctNo, IFSCode, PanNo, AadharNo, JoiningAmt, WalletBalance, Status, AprovedBy, AprovalDate, AprovalNumber } = req.body;
    const insertQuery = 'INSERT INTO reginfo (ProfileImage,PerName,FathersName,DOB,NomineeName,StateId,DistId,BlockName,PO,PS,Village,Pincode,ContactNo,MailId,BankName,BranchName,AcctNo,IFSCode,PanNo,AadharNo,JoiningAmt,WalletBalance,Status,AprovedBy,AprovalDate,AprovalNumber) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
    db.query(insertQuery, [ProfileImage, PerName, FathersName, DOB, NomineeName, StateId, DistId, BlockName, PO, PS, Village, Pincode, ContactNo, MailId, BankName, BranchName, AcctNo, IFSCode, PanNo, AadharNo, JoiningAmt, WalletBalance, Status, AprovedBy, AprovalDate, AprovalNumber], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User added successfully', id: result.insertId });
    });
});

app.put('/RegInfo/:RegInfoId', (req, res) => {
    const { RegInfoId } = req.params;
    const { ProfileImage, PerName, FathersName, DOB, NomineeName, StateId, DistId, BlockName, PO, PS, Village, Pincode, ContactNo, MailId, BankName, BranchName, AcctNo, IFSCode, PanNo, AadharNo, JoiningAmt, WalletBalance, Status, AprovedBy, AprovalDate, AprovalNumber } = req.body;
    const updateQuery = 'UPDATE reginfo SET ProfileImage=?, PerName=?, FathersName=?, DOB=?, NomineeName=?, StateId=?, DistId=?, BlockName=?, PO=?, PS=?, Village=?, Pincode=?, ContactNo=?, MailId=?, BankName=?, BranchName=?, AcctNo=?, IFSCode=?, PanNo=?, AadharNo=?, JoiningAmt=?, WalletBalance=?, Status=?, AprovedBy=?, AprovalDate=?, AprovalNumber=? WHERE RegInfoId=?';
    db.query(updateQuery, [ProfileImage, PerName, FathersName, DOB, NomineeName, StateId, DistId, BlockName, PO, PS, Village, Pincode, ContactNo, MailId, BankName, BranchName, AcctNo, IFSCode, PanNo, AadharNo, JoiningAmt, WalletBalance, Status, AprovedBy, AprovalDate, AprovalNumber, RegInfoId], (err) => {
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

// Use dynamic port for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
});