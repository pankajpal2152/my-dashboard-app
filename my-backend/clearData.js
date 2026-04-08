// // clearData.js
// require('dotenv').config();
// const mysql = require('mysql2');

// // Set up MySQL connection using your existing Environment Variables
// const db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT,
//     database: process.env.DB_NAME,
//     ssl: {
//         rejectUnauthorized: false // CRITICAL: Required for Aiven
//     }
// });

// // Connect to the database
// db.connect((err) => {
//     if (err) {
//         console.error('Database connection failed: ' + err.stack);
//         return;
//     }
//     console.log('Connected to Cloud MySQL database.');

//     // 1. Clear the 'users' table (removes all login/signup accounts)
//     db.query('TRUNCATE TABLE users', (err) => {
//         if (err) {
//             console.error('Error clearing users table:', err.message);
//         } else {
//             console.log('✅ Successfully cleared all data from the "users" table.');
//         }

//         // 2. Clear the 'reginfo' table (removes all client registrations)
//         db.query('TRUNCATE TABLE reginfo', (err) => {
//             if (err) {
//                 console.error('Error clearing reginfo table:', err.message);
//             } else {
//                 console.log('✅ Successfully cleared all data from the "reginfo" table.');
//             }

//             // 3. Close the connection gracefully
//             db.end(() => {
//                 console.log('Database connection closed. Your database is now clean!');
//             });
//         });
//     });
// });