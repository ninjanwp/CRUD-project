const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const cartDb = require("../db/cart");
const pool = require("../db/connection");

// Get user's cart
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const activeCart = await cartDb.getActiveCart(req.user.id);
    const cartItems = await cartDb.getCartItems(activeCart.id);
    res.json({ items: cartItems });
  } catch (err) {
    next(err);
  }
});

// Add item to cart
router.post("/items", requireAuth, async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { productId, quantity } = req.body;
    const activeCart = await cartDb.getActiveCart(req.user.id);

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
      [activeCart.id, productId]
    );

    if (existingItems.length > 0) {
      // Update quantity
      await conn.query(
        "UPDATE cart_item SET quantity = ?, price_at_time = ? WHERE cart_id = ? AND product_id = ?",
        [quantity, product.price, activeCart.id, productId]
      );
    } else {
      // Add new item
      await conn.query(
        "INSERT INTO cart_item (cart_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)",
        [activeCart.id, productId, quantity, product.price]
      );
    }

    await conn.commit();
    const cartItems = await cartDb.getCartItems(activeCart.id);
    res.json({ items: cartItems });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// Update cart item quantity
router.put("/items/:productId", requireAuth, async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { productId } = req.params;
    const { quantity } = req.body;
    const activeCart = await cartDb.getActiveCart(req.user.id);

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

    // Update quantity
    await conn.query(
      "UPDATE cart_item SET quantity = ?, price_at_time = ? WHERE cart_id = ? AND product_id = ?",
      [quantity, product.price, activeCart.id, productId]
    );

    await conn.commit();
    const cartItems = await cartDb.getCartItems(activeCart.id);
    res.json({ items: cartItems });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// Remove item from cart
router.delete("/items/:productId", requireAuth, async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { productId } = req.params;
    const activeCart = await cartDb.getActiveCart(req.user.id);

    await conn.query(
      "DELETE FROM cart_item WHERE cart_id = ? AND product_id = ?",
      [activeCart.id, productId]
    );

    await conn.commit();
    const cartItems = await cartDb.getCartItems(activeCart.id);
    res.json({ items: cartItems });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

module.exports = router;
