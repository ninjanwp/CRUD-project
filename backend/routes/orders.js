const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Get all orders with items
router.get('/', async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, 
        u.email as user_email,
        COUNT(oi.id) as item_count, 
        SUM(oi.quantity) as total_items,
        d.code as discount_code
      FROM \`order\` o
      LEFT JOIN user u ON o.user_id = u.id
      LEFT JOIN order_item oi ON o.id = oi.order_id
      LEFT JOIN discount d ON o.discount_id = d.id
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
      `SELECT * FROM \`order\` WHERE id = ?`,
      [req.params.id]
    );
    
    const [items] = await db.query(`
      SELECT oi.*, p.name, p.description
      FROM order_item oi
      JOIN product p ON oi.product_id = p.id
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
      'INSERT INTO `order` (user_id, status, subtotal, tax_amount, shipping_amount, discount_id, discount_amount, total_amount) VALUES (?, "pending", ?, ?, ?, ?, ?, ?)',
      [userId, subtotal, taxAmount, shippingAmount, discountId, discountAmount, totalAmount]
    );
    
    const orderId = orderResult.insertId;
    
    for (const item of items) {
      await conn.query(
        'INSERT INTO order_item (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
      
      // Update product stock
      await conn.query(
        'UPDATE product SET stock = stock - ? WHERE id = ?',
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