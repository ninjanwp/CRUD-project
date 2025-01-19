require("dotenv").config();
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

async function createAdmin() {
  // Get database credentials from command line arguments
  const dbUser = process.argv[2] || "root";
  const dbPassword = process.argv[3] || "";

  let connection;
  try {
    // Create connection with provided credentials
    connection = await mysql.createConnection({
      host: "localhost",
      user: dbUser,
      password: dbPassword,
      database: "store",
    });

    // Hash the password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Check if admin exists
    const [existing] = await connection.query(
      "SELECT id FROM user WHERE email = ?",
      [ADMIN_EMAIL]
    );

    if (existing.length > 0) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    await connection.query(
      `INSERT INTO user (
        email,
        password_hash,
        first_name,
        last_name,
        role,
        status,
        email_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ADMIN_EMAIL, passwordHash, "Admin", "User", "admin", "active", true]
    );

    console.log("Admin user created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdmin();
