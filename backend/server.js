const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5001; // Port for the server

// Middleware
app.use(cors()); // Allow requests from React
app.use(bodyParser.json()); // Parse JSON requests

require("dotenv").config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
        options: {
        encrypt: true,
        trustServerCertificate: true,
        },
};

// Test database connection
app.get("/api/test-connection", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    res.status(200).send("Database connection successful");
    pool.close();
  } catch (err) {
    console.error("Connection failed:", err.message);
    res.status(500).send("Database connection failed");
  }
});

// Fetch all tables
app.get("/api/tables", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const query = `
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME;
        `;
    const result = await pool.request().query(query);
    res.json(result.recordset);
    pool.close();
  } catch (err) {
    console.error("Error fetching tables:", err.message);
    res.status(500).send("Error fetching tables");
  }
});

// Fetch all records from a specific table
app.get("/api/:tableName", async (req, res) => {
  const { tableName } = req.params;
  try {
    const pool = await sql.connect(dbConfig);
    const query = `SELECT * FROM ${tableName}`;
    const result = await pool.request().query(query);
    res.json(result.recordset);
    pool.close();
  } catch (err) {
    console.error(`Error fetching records from ${tableName}:`, err.message);
    res.status(500).send(`Error fetching records from ${tableName}`);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
