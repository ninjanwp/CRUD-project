require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { pool, checkConnection } = require("./db/connection");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth');
const cartDb = require('./db/cart');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// Auth routes
app.post("/auth/login", async (req, res) => {
  console.log('Login attempt received:', req.body);
  try {
    const { email, password } = req.body;
    
    const [users] = await pool.query(
      'SELECT * FROM user WHERE email = ?',
      [email]
    );
    console.log('Users found:', users.length);

    if (users.length === 0) {
      console.log('No user found with email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    console.log('Comparing passwords for user:', email);
    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', validPassword);

    if (!validPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', email);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.post("/auth/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if user exists
    const [existing] = await pool.query(
      'SELECT id FROM user WHERE email = ?',
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

      const [userResult] = await conn.query(
        'INSERT INTO user (email, first_name, last_name, password_hash, role) VALUES (?, ?, ?, ?, ?)',
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
    const [products] = await pool.query(`
      SELECT p.*, 
        GROUP_CONCAT(DISTINCT c.id) as category_ids,
        GROUP_CONCAT(DISTINCT c.name) as category_names
      FROM product p
      LEFT JOIN product_category pc ON p.id = pc.product_id
      LEFT JOIN category c ON pc.category_id = c.id
      GROUP BY p.id
    `);
    
    res.json({
      data: products,
      total: products.length
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { 
      name, description, price, stock, categories, images,
      sku, is_active, is_featured, cost_price, compare_at_price,
      weight, dimensions, low_stock_threshold,
      meta_title, meta_description,
      manufacturer_id, variants
    } = req.body;

    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const [result] = await conn.query(
      `INSERT INTO product (
        name, description, price, stock, slug,
        sku, is_active, is_featured, cost_price, compare_at_price,
        weight, dimensions, low_stock_threshold,
        meta_title, meta_description, manufacturer_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, description, price, stock, slug,
        sku, is_active, is_featured, cost_price, compare_at_price,
        weight, dimensions, low_stock_threshold,
        meta_title, meta_description, manufacturer_id
      ]
    );

    const productId = result.insertId;

    // Handle variants if provided
    if (variants?.length) {
      for (const variant of variants) {
        const [variantResult] = await conn.query(
          `INSERT INTO product_variant (
            product_id, sku, price, stock, is_active
          ) VALUES (?, ?, ?, ?, ?)`,
          [productId, variant.sku, variant.price, variant.stock, true]
        );

        const variantId = variantResult.insertId;

        // Handle variant attributes
        if (variant.attributes) {
          for (const [attributeId, value] of Object.entries(variant.attributes)) {
            await conn.query(
              `INSERT INTO variant_attribute (variant_id, attribute_id, value) 
               VALUES (?, ?, ?)`,
              [variantId, attributeId, value]
            );
          }
        }
      }
    }

    // Handle categories and images (existing code)
    if (categories?.length) {
      for (const categoryId of categories) {
        await conn.query(
          "INSERT INTO product_category (product_id, category_id) VALUES (?, ?)",
          [productId, categoryId]
        );
      }
    }

    // Handle images if provided
    if (images?.length) {
      for (const [index, image] of images.entries()) {
        await conn.query(
          `INSERT INTO product_image (product_id, url, alt_text, is_primary, display_order) 
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
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const { id } = req.params;
    const { 
      name, description, price, stock,
      sku, is_active, is_featured, cost_price, compare_at_price,
      weight, dimensions, low_stock_threshold,
      meta_title, meta_description,
      categories, images 
    } = req.body;

    const [result] = await conn.query(
      `UPDATE product SET 
        name = ?, description = ?, price = ?, stock = ?,
        sku = ?, is_active = ?, is_featured = ?, cost_price = ?,
        compare_at_price = ?, weight = ?, dimensions = ?,
        low_stock_threshold = ?, meta_title = ?, meta_description = ?
        WHERE id = ?`,
      [
        name, description, price, stock,
        sku, is_active, is_featured, cost_price,
        compare_at_price, weight, dimensions,
        low_stock_threshold, meta_title, meta_description,
        id
      ]
    );

    // Handle categories update
    await conn.query('DELETE FROM product_category WHERE product_id = ?', [id]);
    if (categories?.length) {
      for (const categoryId of categories) {
        await conn.query(
          "INSERT INTO product_category (product_id, category_id) VALUES (?, ?)",
          [id, categoryId]
        );
      }
    }

    // Handle images update
    await conn.query('DELETE FROM product_image WHERE product_id = ?', [id]);
    if (images?.length) {
      for (const [index, image] of images.entries()) {
        await conn.query(
          `INSERT INTO product_image (product_id, url, alt_text, is_primary, display_order) 
           VALUES (?, ?, ?, ?, ?)`,
          [id, image.url, image.alt_text, index === 0, index]
        );
      }
    }

    await conn.commit();
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Delete a product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM product WHERE id = ?", [id]);

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

    const [result] = await pool.query("DELETE FROM product WHERE id IN (?)", [
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
const variantRoutes = require('./routes/variants');

// Use routes
app.use("/api/orders", ordersRouter);
app.use('/api/variants', variantRoutes);

// Error handling middleware
app.use(errorHandler);

// Public routes for storefront
app.get("/api/storefront/products", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, description, price, stock FROM product WHERE stock > 0"
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
      "SELECT id, name, description, price, stock FROM product WHERE id = ? AND stock > 0",
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
      "SELECT * FROM category ORDER BY display_order"
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

// Category management endpoints
app.post("/api/categories", async (req, res) => {
  try {
    const { name, description, display_order } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const [result] = await pool.query(
      "INSERT INTO category (name, description, display_order, slug) VALUES (?, ?, ?, ?)",
      [name, description, display_order, slug]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, display_order } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    await pool.query(
      "UPDATE category SET name = ?, description = ?, display_order = ?, slug = ? WHERE id = ?",
      [name, description, display_order, slug, id]
    );
    res.json({ message: "Category updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        GROUP_CONCAT(DISTINCT c.name) as category_names,
        GROUP_CONCAT(DISTINCT c.id) as categories,
        m.name as manufacturer_name,
        (SELECT url FROM product_image WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', pv.id,
              'sku', pv.sku,
              'price', pv.price,
              'stock', pv.stock,
              'attributes', (
                SELECT JSON_OBJECTAGG(a.code, va.value)
                FROM variant_attribute va
                JOIN attribute a ON va.attribute_id = a.id
                WHERE va.variant_id = pv.id
              )
            )
          )
          FROM product_variant pv
          WHERE pv.product_id = p.id
        ) as variants
      FROM product p
      LEFT JOIN product_category pc ON p.id = pc.product_id
      LEFT JOIN category c ON pc.category_id = c.id
      LEFT JOIN manufacturer m ON p.manufacturer_id = m.id
      WHERE p.id = ?
      GROUP BY p.id
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's active cart
app.get("/api/cart", authMiddleware, async (req, res) => {
  try {
    const cart = await cartDb.getActiveCart(req.user.id);
    const items = await cartDb.getCartItems(cart.id);
    res.json({ ...cart, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add/update cart item
app.post("/api/cart/items", authMiddleware, async (req, res) => {
  try {
    console.group('Cart Update Request');
    console.log('User:', req.user.id);
    console.log('Product:', req.body.productId);
    console.log('Quantity:', req.body.quantity);
    
    const cart = await cartDb.getActiveCart(req.user.id);
    const { productId, quantity } = req.body;
    await cartDb.addToCart(cart.id, productId, quantity);
    
    const [cartContents] = await pool.query(`
      SELECT 
        p.name,
        ci.quantity,
        ci.price_at_time,
        (ci.quantity * ci.price_at_time) as subtotal
      FROM cart_item ci
      JOIN product p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
      ORDER BY p.name
    `, [cart.id]);
    
    console.log('\nUpdated Cart Contents:');
    console.table(cartContents);
    console.groupEnd();
    
    const items = await cartDb.getCartItems(cart.id);
    res.json({ ...cart, items });
  } catch (err) {
    console.error('Cart Update Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Remove cart item
app.delete("/api/cart/items/:productId", authMiddleware, async (req, res) => {
  try {
    const cart = await cartDb.getActiveCart(req.user.id);
    await cartDb.removeFromCart(cart.id, req.params.productId);
    const items = await cartDb.getCartItems(cart.id);
    res.json({ ...cart, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Management Routes
app.post('/api/users', authMiddleware, async (req, res) => {
  try {
    const { email, password, role, is_active } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const [existingUser] = await pool.query('SELECT id FROM user WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO user (email, password_hash, role, status) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, role || 'user', is_active ? 'active' : 'inactive']
    );

    res.status(201).json({
      id: result.insertId,
      email,
      role,
      is_active
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

app.put('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const { email, role, is_active, first_name, last_name } = req.body;
    const userId = req.params.id;

    let updates = [];
    let values = [];

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (role) {
      updates.push('role = ?');
      values.push(role);
    }
    if (typeof is_active !== 'undefined') {
      updates.push('status = ?');
      values.push(is_active ? 'active' : 'inactive');
    }
    if (first_name) {
      updates.push('first_name = ?');
      values.push(first_name);
    }
    if (last_name) {
      updates.push('last_name = ?');
      values.push(last_name);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(userId);
    const [result] = await pool.query(
      `UPDATE user SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Admin User Management Routes
app.post("/api/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    const [existing] = await pool.query(
      'SELECT id FROM user WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with correct role value (either 'admin' or 'customer')
    const [result] = await pool.query(
      'INSERT INTO user (email, password_hash, role, status) VALUES (?, ?, ?, ?)',
      [email, passwordHash, role === 'admin' ? 'admin' : 'customer', 'active']
    );

    res.status(201).json({
      id: result.insertId,
      email,
      role: role === 'admin' ? 'admin' : 'customer'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

// Now the middleware can be used in routes
app.get("/api/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT 
        u.*,
        COUNT(DISTINCT o.id) as orders_count,
        COUNT(DISTINCT ci.id) as cart_items_count
      FROM user u
      LEFT JOIN \`order\` o ON u.id = o.user_id
      LEFT JOIN cart c ON u.id = c.user_id AND c.status = 'active'
      LEFT JOIN cart_item ci ON c.id = ci.cart_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Add this after your other cart routes
app.get("/api/admin/users/:userId/cart", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const cart = await cartDb.getActiveCart(userId);
    
    if (!cart) {
      return res.json({ items: [] });
    }
    
    const items = await cartDb.getCartItems(cart.id);
    res.json({ ...cart, items });
  } catch (err) {
    console.error('Error fetching user cart:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/orders", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT 
        o.*,
        u.email as user_email,
        COUNT(oi.id) as items_count,
        SUM(oi.quantity) as total_items
      FROM \`order\` o
      LEFT JOIN user u ON o.user_id = u.id
      LEFT JOIN order_item oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

app.put("/api/admin/users/:userId", authMiddleware, adminMiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { userId } = req.params;
    const { email, first_name, last_name, role, status } = req.body;
    
    console.log('Updating user:', userId, 'with data:', req.body);

    await conn.beginTransaction();

    const [result] = await conn.query(
      'UPDATE user SET email = ?, first_name = ?, last_name = ?, role = ?, status = ? WHERE id = ?',
      [email, first_name, last_name, role, status, userId]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    const [updatedUser] = await conn.query(
      'SELECT id, email, first_name, last_name, role, status FROM user WHERE id = ?',
      [userId]
    );

    await conn.commit();
    console.log('Updated user:', updatedUser[0]);
    res.json(updatedUser[0]);
  } catch (error) {
    await conn.rollback();
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  } finally {
    conn.release();
  }
});

app.patch("/api/admin/users/:userId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { email, role, status, first_name, last_name } = req.body;
    const userId = req.params.userId;
    
    await pool.query(
      'UPDATE user SET email = ?, role = ?, status = ?, first_name = ?, last_name = ? WHERE id = ?',
      [email, role, status, first_name, last_name, userId]
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

app.get("/api/manufacturers", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, code 
      FROM manufacturer 
      WHERE is_active = true 
      ORDER BY name ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/users/:userId", authMiddleware, adminMiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { userId } = req.params;
    
    // First check if user exists
    const [userExists] = await conn.query('SELECT id FROM user WHERE id = ?', [userId]);
    if (userExists.length === 0) {
      return res.status(404).json({ 
        message: `User with ID ${userId} not found`,
        code: 'USER_NOT_FOUND'
      });
    }

    await conn.beginTransaction();

    // Delete user's related data first (if any)
    await conn.query('DELETE FROM cart WHERE user_id = ?', [userId]);
    await conn.query('DELETE FROM order_item WHERE order_id IN (SELECT id FROM `order` WHERE user_id = ?)', [userId]);
    await conn.query('DELETE FROM `order` WHERE user_id = ?', [userId]);
    
    // Finally delete the user
    const [result] = await conn.query('DELETE FROM user WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ 
        message: 'User could not be deleted',
        code: 'DELETE_FAILED'
      });
    }

    await conn.commit();
    res.json({ 
      message: 'User deleted successfully',
      userId: userId
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      message: 'Failed to delete user', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  } finally {
    conn.release();
  }
});

// Admin routes
app.get("/api/admin/products", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.*, 
        GROUP_CONCAT(DISTINCT c.id) as category_ids,
        GROUP_CONCAT(DISTINCT c.name) as category_names,
        m.name as manufacturer_name,
        (SELECT url FROM product_image WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM product p
      LEFT JOIN product_category pc ON p.id = pc.product_id
      LEFT JOIN category c ON pc.category_id = c.id
      LEFT JOIN manufacturer m ON p.manufacturer_id = m.id
      GROUP BY p.id
    `);
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/categories", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [categories] = await pool.query(
      "SELECT * FROM category ORDER BY display_order"
    );
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/manufacturers", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [manufacturers] = await pool.query(
      "SELECT * FROM manufacturer ORDER BY name"
    );
    res.json(manufacturers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/attributes", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [attributes] = await pool.query(`
      SELECT a.*, ag.name as group_name 
      FROM attribute a
      LEFT JOIN attribute_group ag ON a.group_id = ag.id
      ORDER BY a.display_order
    `);
    res.json(attributes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public routes
app.get("/api/storefront/products", async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.*, 
        (SELECT url FROM product_image WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM product p
      WHERE p.is_active = 1
      ORDER BY p.created_at DESC
    `);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

checkConnection().catch(console.error);
