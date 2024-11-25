const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Get all orders with items
router.get('/', async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, 
        COUNT(oi.id) as item_count, 
        SUM(oi.quantity) as total_items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order details with items
router.get('/:id', async (req, res) => {
  try {
    const [order] = await db.query(
      `SELECT * FROM orders WHERE id = ?`,
      [req.params.id]
    );
    
    const [items] = await db.query(`
      SELECT oi.*, p.name, p.description
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [req.params.id]);
    
    res.json({ ...order[0], items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new order with items
router.post('/', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    const { customer_name, items } = req.body;
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const [orderResult] = await conn.query(
      'INSERT INTO orders (customer_name, total) VALUES (?, ?)',
      [customer_name, total]
    );
    
    const orderId = orderResult.insertId;
    
    for (const item of items) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
      
      // Update product stock
      await conn.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    await conn.commit();
    res.json({ id: orderId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router; 