const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Get all attributes
router.get('/', async (req, res) => {
  try {
    const [attributes] = await pool.query(`
      SELECT a.*, ag.name as group_name 
      FROM attribute a
      LEFT JOIN attribute_group ag ON a.group_id = ag.id
      ORDER BY a.display_order
    `);
    res.json(attributes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create attribute
router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { name, code, type, group_id, is_variant, validation_rules } = req.body;
    
    const [result] = await conn.query(
      'INSERT INTO attribute (name, code, type, group_id, is_variant, validation_rules) VALUES (?, ?, ?, ?, ?, ?)',
      [name, code, type, group_id, is_variant, JSON.stringify(validation_rules)]
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