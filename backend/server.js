require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { pool, checkConnection } = require("./db/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { requireAuth } = require("./middleware/auth");
const cartDb = require("./db/cart");
const errorHandler = require("./middleware/errorHandler");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const cartRoutes = require("./routes/cart");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access required" });
  }
};

// Auth routes
app.post("/auth/login", async (req, res) => {
  console.log("Login attempt received:", req.body);
  try {
    const { email, password } = req.body;

    const [users] = await pool.query("SELECT * FROM user WHERE email = ?", [
      email,
    ]);
    console.log("Users found:", users.length);

    if (users.length === 0) {
      console.log("No user found with email:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    console.log("Comparing passwords for user:", email);
    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log("Password valid:", validPassword);

    if (!validPassword) {
      console.log("Invalid password for user:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Login successful for:", email);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

app.post("/auth/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const [existing] = await pool.query("SELECT id FROM user WHERE email = ?", [
      email,
    ]);

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with first and last name
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [userResult] = await conn.query(
        "INSERT INTO user (email, first_name, last_name, password_hash, role) VALUES (?, ?, ?, ?, ?)",
        [email, firstName, lastName, passwordHash, "customer"]
      );

      await conn.commit();

      res.json({ message: "Registration successful" });
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

app.get("/auth/validate", requireAuth, async (req, res) => {
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
      total: products.length,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: err.message });
  }
});

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = "uploads/products";
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF and WebP are allowed."
        )
      );
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Image upload endpoint
app.post(
  "/api/admin/upload",
  requireAuth,
  adminMiddleware,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const uploadedFiles = req.files.map((file) => ({
        url: `/uploads/products/${file.filename}`,
        alt_text: file.originalname,
      }));
      res.json(uploadedFiles);
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ error: "Failed to upload files" });
    }
  }
);

// Add helper function for cleaning up unused images
const cleanupUnusedImages = async (productId, newImages = []) => {
  try {
    // Get existing images for the product
    const [existingImages] = await pool.query(
      "SELECT url FROM product_image WHERE product_id = ?",
      [productId]
    );

    // Get the filenames from the URLs
    const existingFiles = existingImages.map((img) => path.basename(img.url));
    const newFiles = newImages.map((img) => path.basename(img.url));

    // Find files that are no longer used
    const filesToDelete = existingFiles.filter(
      (file) => !newFiles.includes(file)
    );

    // Delete unused files
    for (const file of filesToDelete) {
      const filePath = path.join(__dirname, "uploads/products", file);
      await fs.unlink(filePath).catch(() => {});
    }
  } catch (error) {
    console.error("Error cleaning up images:", error);
  }
};

// Update product creation endpoint to handle images
app.post(
  "/api/admin/products",
  requireAuth,
  adminMiddleware,
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      console.log("Creating product with data:", req.body);

      // Generate slug from name
      const slug = req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Insert the product
      const [result] = await connection.query(
        `INSERT INTO product (
        name, description, price, stock, sku,
        is_active, is_featured, cost_price, compare_at_price,
        weight, width, height, length, low_stock_threshold,
        meta_title, meta_description, manufacturer_id, slug
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.body.name,
          req.body.description || "",
          parseFloat(req.body.price) || 0,
          parseInt(req.body.stock) || 0,
          req.body.sku || null,
          Boolean(req.body.is_active),
          Boolean(req.body.is_featured),
          parseFloat(req.body.cost_price) || 0,
          parseFloat(req.body.compare_at_price) || 0,
          parseFloat(req.body.weight) || 0,
          parseFloat(req.body.width) || 0,
          parseFloat(req.body.height) || 0,
          parseFloat(req.body.length) || 0,
          parseInt(req.body.low_stock_threshold) || 0,
          req.body.meta_title || "",
          req.body.meta_description || "",
          req.body.manufacturer_id || null,
          slug,
        ]
      );

      const productId = result.insertId;
      console.log("Created product with ID:", productId);

      // Handle categories
      if (req.body.categories && req.body.categories.length > 0) {
        const categoryValues = req.body.categories
          .map((categoryId) => [productId, categoryId])
          .filter(([, categoryId]) => categoryId);

        if (categoryValues.length > 0) {
          await connection.query(
            "INSERT INTO product_category (product_id, category_id) VALUES ?",
            [categoryValues]
          );
          console.log("Added categories:", categoryValues);
        }
      }

      // Handle images
      if (req.body.images && req.body.images.length > 0) {
        const imageValues = req.body.images.map((image, index) => [
          productId,
          image.url,
          image.alt_text || "",
          index, // display_order
          index === 0, // is_primary
        ]);

        await connection.query(
          `INSERT INTO product_image (product_id, url, alt_text, display_order, is_primary) 
         VALUES ?`,
          [imageValues]
        );
        console.log("Added images:", imageValues);
      }

      await connection.commit();

      // Fetch the created product with all its relations
      const [products] = await connection.query(
        `SELECT 
        p.*,
        GROUP_CONCAT(DISTINCT pc.category_id) as category_ids,
        GROUP_CONCAT(DISTINCT c.name) as category_names,
        CONCAT('[', 
          GROUP_CONCAT(
            DISTINCT 
            JSON_OBJECT(
              'url', pi.url,
              'alt_text', pi.alt_text,
              'is_primary', pi.is_primary,
              'display_order', pi.display_order
            )
          ),
        ']') as images,
        m.name as manufacturer_name
      FROM product p
      LEFT JOIN product_category pc ON p.id = pc.product_id
      LEFT JOIN category c ON pc.category_id = c.id
      LEFT JOIN product_image pi ON p.id = pi.product_id
      LEFT JOIN manufacturer m ON p.manufacturer_id = m.id
      WHERE p.id = ?
      GROUP BY p.id`,
        [productId]
      );

      const product = products[0];
      if (product) {
        product.category_ids = product.category_ids
          ? product.category_ids.split(",").map(Number)
          : [];
        product.category_names = product.category_names
          ? product.category_names.split(",")
          : [];
        product.images = product.images ? JSON.parse(product.images) : [];
        // Parse numeric fields
        product.price = parseFloat(product.price);
        product.stock = parseInt(product.stock);
        product.cost_price = parseFloat(product.cost_price);
        product.compare_at_price = parseFloat(product.compare_at_price);
        product.weight = parseFloat(product.weight);
        product.width = parseFloat(product.width);
        product.height = parseFloat(product.height);
        product.length = parseFloat(product.length);
        product.low_stock_threshold = parseInt(product.low_stock_threshold);
      }

      res.status(201).json(product);
    } catch (error) {
      await connection.rollback();
      console.error("Error creating product:", error);
      res
        .status(500)
        .json({ message: "Failed to create product", error: error.message });
    } finally {
      connection.release();
    }
  }
);

// Update a product
app.put(
  "/api/admin/products/:id",
  requireAuth,
  adminMiddleware,
  async (req, res) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const { id } = req.params;
      const {
        name,
        description,
        price,
        stock,
        sku,
        is_active,
        is_featured,
        cost_price,
        compare_at_price,
        weight,
        width,
        height,
        length,
        low_stock_threshold,
        meta_title,
        meta_description,
        manufacturer_id,
        categories,
        images,
      } = req.body;

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Update the product
      await conn.query(
        `UPDATE product SET 
        name = ?, description = ?, price = ?, stock = ?,
        sku = ?, is_active = ?, is_featured = ?, cost_price = ?,
        compare_at_price = ?, weight = ?, width = ?, height = ?,
        length = ?, low_stock_threshold = ?, meta_title = ?, 
        meta_description = ?, manufacturer_id = ?, slug = ?
        WHERE id = ?`,
        [
          name,
          description || "",
          parseFloat(price) || 0,
          parseInt(stock) || 0,
          sku || null,
          Boolean(is_active),
          Boolean(is_featured),
          parseFloat(cost_price) || 0,
          parseFloat(compare_at_price) || 0,
          parseFloat(weight) || 0,
          parseFloat(width) || 0,
          parseFloat(height) || 0,
          parseFloat(length) || 0,
          parseInt(low_stock_threshold) || 0,
          meta_title || "",
          meta_description || "",
          manufacturer_id || null,
          slug,
          id,
        ]
      );

      // Clean up unused images before updating image records
      await cleanupUnusedImages(id, images);

      // Handle categories update
      await conn.query("DELETE FROM product_category WHERE product_id = ?", [
        id,
      ]);
      if (categories?.length) {
        const categoryValues = categories
          .map((categoryId) => [id, categoryId])
          .filter(([, categoryId]) => categoryId);

        if (categoryValues.length > 0) {
          await conn.query(
            "INSERT INTO product_category (product_id, category_id) VALUES ?",
            [categoryValues]
          );
        }
      }

      // Handle images update
      await conn.query("DELETE FROM product_image WHERE product_id = ?", [id]);
      if (images?.length) {
        const imageValues = images.map((image, index) => [
          id,
          image.url,
          image.alt_text || "",
          index,
          index === 0,
        ]);

        await conn.query(
          `INSERT INTO product_image (product_id, url, alt_text, display_order, is_primary) 
         VALUES ?`,
          [imageValues]
        );
      }

      await conn.commit();

      // Fetch the updated product
      const [products] = await conn.query(
        `SELECT 
        p.*,
        GROUP_CONCAT(DISTINCT pc.category_id) as category_ids,
        GROUP_CONCAT(DISTINCT c.name) as category_names,
        CONCAT('[', 
          GROUP_CONCAT(
            DISTINCT 
            JSON_OBJECT(
              'url', pi.url,
              'alt_text', pi.alt_text,
              'is_primary', pi.is_primary,
              'display_order', pi.display_order
            )
          ),
        ']') as images,
        m.name as manufacturer_name
      FROM product p
      LEFT JOIN product_category pc ON p.id = pc.product_id
      LEFT JOIN category c ON pc.category_id = c.id
      LEFT JOIN product_image pi ON p.id = pi.product_id
      LEFT JOIN manufacturer m ON p.manufacturer_id = m.id
      WHERE p.id = ?
      GROUP BY p.id`,
        [id]
      );

      const product = products[0];
      if (product) {
        product.category_ids = product.category_ids
          ? product.category_ids.split(",").map(Number)
          : [];
        product.category_names = product.category_names
          ? product.category_names.split(",")
          : [];
        product.images = product.images ? JSON.parse(product.images) : [];
        // Parse numeric fields
        product.price = parseFloat(product.price);
        product.stock = parseInt(product.stock);
        product.cost_price = parseFloat(product.cost_price);
        product.compare_at_price = parseFloat(product.compare_at_price);
        product.weight = parseFloat(product.weight);
        product.width = parseFloat(product.width);
        product.height = parseFloat(product.height);
        product.length = parseFloat(product.length);
        product.low_stock_threshold = parseInt(product.low_stock_threshold);
      }

      res.json(product);
    } catch (error) {
      await conn.rollback();
      console.error("Error updating product:", error);
      res
        .status(500)
        .json({ message: "Failed to update product", error: error.message });
    } finally {
      conn.release();
    }
  }
);

// Update the delete product endpoint to use the admin prefix
app.delete(
  "/api/admin/products/:id",
  requireAuth,
  adminMiddleware,
  async (req, res) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const { id } = req.params;

      // Delete related records first
      await conn.query("DELETE FROM product_category WHERE product_id = ?", [
        id,
      ]);
      await conn.query("DELETE FROM product_image WHERE product_id = ?", [id]);
      await conn.query("DELETE FROM cart_item WHERE product_id = ?", [id]);

      // Delete the product
      const [result] = await conn.query("DELETE FROM product WHERE id = ?", [
        id,
      ]);

      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({ message: "Product not found" });
      }

      await conn.commit();
      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      await conn.rollback();
      console.error("Error deleting product:", err);
      res.status(500).json({ error: err.message });
    } finally {
      conn.release();
    }
  }
);

// Update the bulk delete endpoint to use the admin prefix
app.delete(
  "/api/admin/products",
  requireAuth,
  adminMiddleware,
  async (req, res) => {
    const conn = await pool.getConnection();
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids)) {
        return res
          .status(400)
          .json({ message: "Invalid request: ids array required" });
      }

      await conn.beginTransaction();

      // Delete related records first
      await conn.query("DELETE FROM product_category WHERE product_id IN (?)", [
        ids,
      ]);
      await conn.query("DELETE FROM product_image WHERE product_id IN (?)", [
        ids,
      ]);
      await conn.query("DELETE FROM cart_item WHERE product_id IN (?)", [ids]);

      // Delete the products
      const [result] = await conn.query("DELETE FROM product WHERE id IN (?)", [
        ids,
      ]);

      await conn.commit();
      res.json({
        message: `${result.affectedRows} products deleted successfully`,
      });
    } catch (err) {
      await conn.rollback();
      console.error("Error deleting products:", err);
      res.status(500).json({ error: err.message });
    } finally {
      conn.release();
    }
  }
);

// Import routes
const ordersRouter = require("./routes/orders");
const variantRoutes = require("./routes/variants");

// Use routes
app.use("/api/orders", ordersRouter);
app.use("/api/variants", variantRoutes);

// Register routes
app.use("/api/cart", cartRoutes);

// Error handling middleware
app.use(errorHandler);

// Public routes for storefront
app.get("/api/storefront/products", async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT 
        p.*,
        CONCAT('[', 
          GROUP_CONCAT(
            DISTINCT 
            JSON_OBJECT(
              'url', pi.url,
              'alt_text', pi.alt_text,
              'is_primary', pi.is_primary,
              'display_order', pi.display_order
            )
          ),
        ']') as images
      FROM product p
      LEFT JOIN product_image pi ON p.id = pi.product_id
      WHERE p.is_active = 1
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    const processedProducts = products.map((product) => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
    }));

    res.json(processedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product details
app.get("/api/storefront/products/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        p.*,
        CONCAT('[', 
          GROUP_CONCAT(
            DISTINCT 
            JSON_OBJECT(
              'url', pi.url,
              'alt_text', pi.alt_text,
              'is_primary', pi.is_primary,
              'display_order', pi.display_order
            )
          ),
        ']') as images
      FROM product p
      LEFT JOIN product_image pi ON p.id = pi.product_id
      WHERE p.id = ? AND p.is_active = 1
      GROUP BY p.id`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = rows[0];
    product.images = product.images ? JSON.parse(product.images) : [];

    res.json(product);
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
app.get("/api/test-auth", requireAuth, async (req, res) => {
  try {
    res.json({
      message: "Auth is working!",
      user: req.user,
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
    console.error("Error creating category:", err);
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
    const [rows] = await pool.query(
      `
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
    `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's active cart
app.get("/api/cart", requireAuth, async (req, res) => {
  try {
    console.log("Fetching cart for user:", req.user.id);
    const cart = await cartDb.getActiveCart(req.user.id);
    console.log("Active cart:", cart);
    const items = await cartDb.getCartItems(cart.id);
    console.log("Cart items:", items);
    res.json({ ...cart, items });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add/update cart item
app.post("/api/cart/items", requireAuth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    console.log("Adding/updating cart item for user:", req.user.id);
    const cart = await cartDb.getActiveCart(req.user.id);
    console.log("Active cart:", cart);
    const { productId, quantity } = req.body;

    // Get current product price and check if product exists
    const [products] = await conn.query(
      "SELECT id, price, stock FROM product WHERE id = ? AND is_active = 1",
      [productId]
    );

    if (products.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Product not found or inactive" });
    }

    const product = products[0];

    // Check stock
    if (product.stock < quantity) {
      await conn.rollback();
      return res.status(400).json({ error: "Not enough stock available" });
    }

    // Check if item exists in cart
    const [existingItems] = await conn.query(
      "SELECT * FROM cart_item WHERE cart_id = ? AND product_id = ?",
      [cart.id, productId]
    );

    if (existingItems.length > 0) {
      // Update quantity
      await conn.query(
        "UPDATE cart_item SET quantity = ?, price_at_time = ? WHERE cart_id = ? AND product_id = ?",
        [quantity, product.price, cart.id, productId]
      );
    } else {
      // Add new item
      await conn.query(
        "INSERT INTO cart_item (cart_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)",
        [cart.id, productId, quantity, product.price]
      );
    }

    await conn.commit();
    console.log("Successfully updated cart");
    const items = await cartDb.getCartItems(cart.id);
    res.json({ ...cart, items });
  } catch (err) {
    await conn.rollback();
    console.error("Error updating cart:", err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Delete cart item
app.delete("/api/cart/items/:productId", requireAuth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    console.log("Deleting cart item for user:", req.user.id);
    const cart = await cartDb.getActiveCart(req.user.id);
    console.log("Active cart:", cart);

    await conn.query(
      "DELETE FROM cart_item WHERE cart_id = ? AND product_id = ?",
      [cart.id, req.params.productId]
    );

    await conn.commit();
    console.log("Successfully deleted cart item");
    const items = await cartDb.getCartItems(cart.id);
    res.json({ ...cart, items });
  } catch (err) {
    await conn.rollback();
    console.error("Error deleting cart item:", err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// User Management Routes
app.post("/api/users", requireAuth, async (req, res) => {
  try {
    const { email, password, role, is_active } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if user already exists
    const [existingUser] = await pool.query(
      "SELECT id FROM user WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await pool.query(
      "INSERT INTO user (email, password_hash, role, status) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, role || "user", is_active ? "active" : "inactive"]
    );

    res.status(201).json({
      id: result.insertId,
      email,
      role,
      is_active,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

app.put("/api/users/:id", requireAuth, async (req, res) => {
  try {
    const { email, role, is_active, first_name, last_name } = req.body;
    const userId = req.params.id;

    let updates = [];
    let values = [];

    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (role) {
      updates.push("role = ?");
      values.push(role);
    }
    if (typeof is_active !== "undefined") {
      updates.push("status = ?");
      values.push(is_active ? "active" : "inactive");
    }
    if (first_name) {
      updates.push("first_name = ?");
      values.push(first_name);
    }
    if (last_name) {
      updates.push("last_name = ?");
      values.push(last_name);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(userId);
    const [result] = await pool.query(
      `UPDATE user SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// Admin User Management Routes
app.post("/api/admin/users", requireAuth, adminMiddleware, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const [existing] = await pool.query("SELECT id FROM user WHERE email = ?", [
      email,
    ]);

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with correct role value (either 'admin' or 'customer')
    const [result] = await pool.query(
      "INSERT INTO user (email, password_hash, role, status) VALUES (?, ?, ?, ?)",
      [email, passwordHash, role === "admin" ? "admin" : "customer", "active"]
    );

    res.status(201).json({
      id: result.insertId,
      email,
      role: role === "admin" ? "admin" : "customer",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
  }
});

// Now the middleware can be used in routes
app.get("/api/admin/users", requireAuth, adminMiddleware, async (req, res) => {
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
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
});

// Add this after your other cart routes
app.get(
  "/api/admin/users/:userId/cart",
  requireAuth,
  adminMiddleware,
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const cart = await cartDb.getActiveCart(userId);

      if (!cart) {
        return res.json({ items: [] });
      }

      const items = await cartDb.getCartItems(cart.id);
      res.json({ ...cart, items });
    } catch (err) {
      console.error("Error fetching user cart:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

app.get("/api/admin/orders", requireAuth, adminMiddleware, async (req, res) => {
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
    console.error("Error fetching orders:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: error.message });
  }
});

app.put(
  "/api/admin/users/:userId",
  requireAuth,
  adminMiddleware,
  async (req, res) => {
    const conn = await pool.getConnection();
    try {
      const { userId } = req.params;
      const { email, first_name, last_name, role, status } = req.body;

      console.log("Updating user:", userId, "with data:", req.body);

      await conn.beginTransaction();

      const [result] = await conn.query(
        "UPDATE user SET email = ?, first_name = ?, last_name = ?, role = ?, status = ? WHERE id = ?",
        [email, first_name, last_name, role, status, userId]
      );

      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({ message: "User not found" });
      }

      const [updatedUser] = await conn.query(
        "SELECT id, email, first_name, last_name, role, status FROM user WHERE id = ?",
        [userId]
      );

      await conn.commit();
      console.log("Updated user:", updatedUser[0]);
      res.json(updatedUser[0]);
    } catch (error) {
      await conn.rollback();
      console.error("Error updating user:", error);
      res
        .status(500)
        .json({ message: "Failed to update user", error: error.message });
    } finally {
      conn.release();
    }
  }
);

app.patch(
  "/api/admin/users/:userId",
  requireAuth,
  adminMiddleware,
  async (req, res) => {
    try {
      const { email, role, status, first_name, last_name } = req.body;
      const userId = req.params.userId;

      await pool.query(
        "UPDATE user SET email = ?, role = ?, status = ?, first_name = ?, last_name = ? WHERE id = ?",
        [email, role, status, first_name, last_name, userId]
      );

      res.json({ message: "User updated successfully" });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  }
);

// Update manufacturers endpoint to use admin prefix and auth
app.get(
  "/api/admin/manufacturers",
  requireAuth,
  adminMiddleware,
  async (req, res) => {
    try {
      const [rows] = await pool.query(`
      SELECT 
        m.*,
        COUNT(DISTINCT p.id) as products_count
      FROM manufacturer m
      LEFT JOIN product p ON m.id = p.manufacturer_id
      WHERE m.is_active = true 
      GROUP BY m.id
      ORDER BY m.name ASC
    `);
      res.json(rows);
    } catch (err) {
      console.error("Error fetching manufacturers:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Keep the public endpoint for storefront
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

app.delete(
  "/api/admin/users/:userId",
  requireAuth,
  adminMiddleware,
  async (req, res) => {
    const conn = await pool.getConnection();
    try {
      const { userId } = req.params;

      // First check if user exists
      const [userExists] = await conn.query(
        "SELECT id FROM user WHERE id = ?",
        [userId]
      );
      if (userExists.length === 0) {
        return res.status(404).json({
          message: `User with ID ${userId} not found`,
          code: "USER_NOT_FOUND",
        });
      }

      await conn.beginTransaction();

      // Delete user's related data first (if any)
      await conn.query("DELETE FROM cart WHERE user_id = ?", [userId]);
      await conn.query(
        "DELETE FROM order_item WHERE order_id IN (SELECT id FROM `order` WHERE user_id = ?)",
        [userId]
      );
      await conn.query("DELETE FROM `order` WHERE user_id = ?", [userId]);

      // Finally delete the user
      const [result] = await conn.query("DELETE FROM user WHERE id = ?", [
        userId,
      ]);

      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({
          message: "User could not be deleted",
          code: "DELETE_FAILED",
        });
      }

      await conn.commit();
      res.json({
        message: "User deleted successfully",
        userId: userId,
      });
    } catch (error) {
      await conn.rollback();
      console.error("Error deleting user:", error);
      res.status(500).json({
        message: "Failed to delete user",
        error: error.message,
        code: "SERVER_ERROR",
      });
    } finally {
      conn.release();
    }
  }
);

// Admin product routes
app.get(
  "/api/admin/products",
  requireAuth,
  adminMiddleware,
  async (req, res) => {
    try {
      const query = `
        SELECT 
          p.*,
          GROUP_CONCAT(DISTINCT pc.category_id) as category_ids,
          GROUP_CONCAT(DISTINCT c.name) as category_names,
          CONCAT('[', 
            GROUP_CONCAT(
              DISTINCT 
              JSON_OBJECT(
                'url', pi.url,
                'alt_text', pi.alt_text,
                'is_primary', pi.is_primary,
                'display_order', pi.display_order
              )
            ),
          ']') as images,
          m.name as manufacturer_name
        FROM product p
        LEFT JOIN product_category pc ON p.id = pc.product_id
        LEFT JOIN category c ON pc.category_id = c.id
        LEFT JOIN product_image pi ON p.id = pi.product_id
        LEFT JOIN manufacturer m ON p.manufacturer_id = m.id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;

      const [products] = await pool.query(query);

      // Process the results
      const processedProducts = products.map((product) => ({
        ...product,
        category_ids: product.category_ids
          ? product.category_ids.split(",").map(Number)
          : [],
        category_names: product.category_names
          ? product.category_names.split(",")
          : [],
        images: product.images ? JSON.parse(product.images) : [],
        price: parseFloat(product.price),
        stock: parseInt(product.stock),
        cost_price: parseFloat(product.cost_price),
        compare_at_price: parseFloat(product.compare_at_price),
        weight: parseFloat(product.weight),
        width: parseFloat(product.width),
        height: parseFloat(product.height),
        length: parseFloat(product.length),
        low_stock_threshold: parseInt(product.low_stock_threshold),
      }));

      res.json(processedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch products", error: error.message });
    }
  }
);

// Add this with your other admin routes
app.get(
  "/api/admin/categories",
  requireAuth,
  adminMiddleware,
  async (req, res) => {
    try {
      const [rows] = await pool.query(`
      SELECT c.*, 
             COUNT(DISTINCT pc.product_id) as products_count
      FROM category c
      LEFT JOIN product_category pc ON c.id = pc.category_id
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.name ASC
    `);
      res.json(rows);
    } catch (err) {
      console.error("Error fetching categories:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Add/update category management endpoints
app.post(
  "/api/admin/categories",
  requireAuth,
  adminMiddleware,
  async (req, res) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const { name, description, display_order } = req.body;
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const [result] = await conn.query(
        "INSERT INTO category (name, description, display_order, slug) VALUES (?, ?, ?, ?)",
        [name, description || "", display_order || 0, slug]
      );

      await conn.commit();

      const [category] = await conn.query(
        "SELECT * FROM category WHERE id = ?",
        [result.insertId]
      );

      res.status(201).json(category[0]);
    } catch (err) {
      await conn.rollback();
      console.error("Error creating category:", err);
      res.status(500).json({ error: err.message });
    } finally {
      conn.release();
    }
  }
);

app.put(
  "/api/admin/categories/:id",
  requireAuth,
  adminMiddleware,
  async (req, res) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const { id } = req.params;
      const { name, description, display_order } = req.body;
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const [result] = await conn.query(
        "UPDATE category SET name = ?, description = ?, display_order = ?, slug = ? WHERE id = ?",
        [name, description || "", display_order || 0, slug, id]
      );

      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({ message: "Category not found" });
      }

      await conn.commit();

      const [category] = await conn.query(
        "SELECT * FROM category WHERE id = ?",
        [id]
      );

      res.json(category[0]);
    } catch (err) {
      await conn.rollback();
      console.error("Error updating category:", err);
      res.status(500).json({ error: err.message });
    } finally {
      conn.release();
    }
  }
);

app.delete(
  "/api/admin/categories/:id",
  requireAuth,
  adminMiddleware,
  async (req, res) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const { id } = req.params;

      // First remove category associations
      await conn.query("DELETE FROM product_category WHERE category_id = ?", [
        id,
      ]);

      // Then delete the category
      const [result] = await conn.query("DELETE FROM category WHERE id = ?", [
        id,
      ]);

      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({ message: "Category not found" });
      }

      await conn.commit();
      res.json({ message: "Category deleted successfully" });
    } catch (err) {
      await conn.rollback();
      console.error("Error deleting category:", err);
      res.status(500).json({ error: err.message });
    } finally {
      conn.release();
    }
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

checkConnection().catch(console.error);
