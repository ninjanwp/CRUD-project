require('dotenv').config();
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

async function createAdminUser() {
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await pool.query(
    "INSERT INTO users (email, first_name, last_name, password_hash, role) VALUES (?, ?, ?, ?, ?)",
    ["admin@example.com", "Admin", "User", hashedPassword, "admin"]
  );

  console.log("Admin user created successfully");
  process.exit(0);
}

createAdminUser().catch(console.error);
