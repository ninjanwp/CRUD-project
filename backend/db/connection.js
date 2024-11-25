const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "store",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Add connection error handling
pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Add connection health check
const checkConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection successful');
  } catch (err) {
    console.error('Database connection failed:', err);
  }
};

module.exports = pool.promise();
