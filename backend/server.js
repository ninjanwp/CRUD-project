require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db/connection");

const app = express();
const PORT = process.env.PORT || 8000; 

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Auth routes
app.post("/auth/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    // For testing purposes, accept any login
    res.json({
      token: "test-token-123",
      user: {
        id: 1,
        email: identifier,
        role: "admin"
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/auth/validate", async (req, res) => {
  // For testing purposes, always validate
  res.json({ valid: true });
});

// Orders routes
app.get("/api/orders", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM orders");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    console.log('Products query result:', rows); // Debug log
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const [result] = await db.query(
      "INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)",
      [name, description, price, stock]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;

    const [result] = await db.query(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?',
      [name, description, price, stock, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Import routes
const ordersRouter = require('./routes/orders');

// Use routes
app.use('/api/orders', ordersRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Print all products on server start
const printAllProducts = async () => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    console.log('\nCurrent products in database:');
    console.table(rows);
  } catch (err) {
    console.error('Error fetching products:', err);
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await printAllProducts();
});
