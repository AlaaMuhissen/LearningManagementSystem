import mysql from 'mysql2/promise'; 
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10, // Adjust this value as per your requirements
  queueLimit: 0

});
export default pool;

// pool.getConnection((err, connection) => {
//   if (err) {
//     console.error('Error connecting to MySQL:', err);
//     console.error('Check if MySQL server is running and credentials are correct.');
//     return;
//   }
//   console.log('Connected to MySQL database');

//   // Release the connection after it's used
//   connection.release();
// });
