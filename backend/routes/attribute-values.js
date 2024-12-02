const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

router.get('/:attributeId', async (req, res) => {
  try {
    const [values] = await pool.query(
      'SELECT * FROM attribute_value WHERE attribute_id = ? ORDER BY display_order',
      [req.params.attributeId]
    );
    res.json(values);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:attributeId', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { value, display_order } = req.body;
    
    const [result] = await conn.query(
      'INSERT INTO attribute_value (attribute_id, value, display_order) VALUES (?, ?, ?)',
      [req.params.attributeId, value, display_order]
    );
    
    await conn.commit();
    res.json({ id: result.insertId, ...req.body });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
}); 