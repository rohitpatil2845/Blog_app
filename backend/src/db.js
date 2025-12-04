import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Support both connection URL and individual credentials
const pool = process.env.MYSQL_URL 
    ? mysql.createPool(process.env.MYSQL_URL)
    : mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'blogapp',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

export default pool;
