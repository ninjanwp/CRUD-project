require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { pool, checkConnection } = require("./db/connection");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Auth routes
app.post("/auth/login", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { email, password } = req.body;
    
    const [users] = await conn.query(
      'SELECT * FROM users WHERE email = ? AND status = "active"',
      [email]
    );

    const user = users[0];
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login timestamp
    await conn.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Get fresh user data after update
    const [updatedUsers] = await conn.query(
      'SELECT * FROM users WHERE id = ?',
      [user.id]
    );
    const updatedUser = updatedUsers[0];

    res.json({
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        lastLogin: updatedUser.last_login,
        status: updatedUser.status,
        emailVerified: updatedUser.email_verified
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.post("/auth/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if user exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with first and last name
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [userResult] = await pool.query(
        'INSERT INTO users (email, first_name, last_name, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [email, firstName, lastName, passwordHash, 'customer']
      );

      await conn.commit();

      res.json({ message: 'Registration successful' });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/auth/validate", authMiddleware, async (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Orders routes
app.get("/api/orders", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM orders");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, 
        GROUP_CONCAT(c.name) as categories,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      GROUP BY p.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { name, description, price, stock, categories, images } = req.body;
    const [result] = await conn.query(
      `INSERT INTO products (name, description, price, stock, slug) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, price, stock, name.toLowerCase().replace(/\s+/g, "-")]
    );

    const productId = result.insertId;

    // Handle categories if provided
    if (categories?.length) {
      for (const categoryId of categories) {
        await conn.query(
          "INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)",
          [productId, categoryId]
        );
      }
    }

    // Handle images if provided
    if (images?.length) {
      for (const [index, image] of images.entries()) {
        await conn.query(
          `INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order) 
           VALUES (?, ?, ?, ?, ?)`,
          [productId, image.url, image.alt_text, index === 0, index]
        );
      }
    }

    await conn.commit();
    res.json({ id: productId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Update a product
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;

    const [result] = await pool.query(
      "UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?",
      [name, description, price, stock, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add this new endpoint for bulk delete
app.delete("/api/products", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res
        .status(400)
        .json({ message: "Invalid request: ids array required" });
    }

    const [result] = await pool.query("DELETE FROM products WHERE id IN (?)", [
      ids,
    ]);

    res.json({
      message: `${result.affectedRows} products deleted successfully`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Import routes
const ordersRouter = require("./routes/orders");

// Use routes
app.use("/api/orders", ordersRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Print all products on server start
const printAllProducts = async () => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    console.log("\nCurrent products in database:");
    console.table(rows);
  } catch (err) {
    console.error("Error fetching products:", err);
  }
};

// Public routes for storefront
app.get("/api/storefront/products", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, description, price, stock FROM products WHERE stock > 0"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product details
app.get("/api/storefront/products/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, description, price, stock FROM products WHERE id = ? AND stock > 0",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add these new endpoints after your existing ones
app.get("/api/categories", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM categories ORDER BY display_order"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add this near your other test routes
app.get("/api/test-auth", authMiddleware, async (req, res) => {
  try {
    res.json({ 
      message: "Auth is working!", 
      user: req.user 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add this near the top with your other routes
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await printAllProducts();
});

checkConnection().catch(console.error);
