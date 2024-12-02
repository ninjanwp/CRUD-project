const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Get variants for a product
router.get('/product/:productId', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [variants] = await conn.query(`
      SELECT 
        v.*,
        GROUP_CONCAT(
          JSON_OBJECT(
            'attribute_id', a.id,
            'attribute_name', a.name,
            'value_id', av.id,
            'value', av.value
          )
        ) as attributes
      FROM product_variant v
      LEFT JOIN variant_attribute_value vav ON v.id = vav.variant_id
      LEFT JOIN attribute a ON vav.attribute_id = a.id
      LEFT JOIN attribute_value av ON vav.value_id = av.id
      WHERE v.product_id = ?
      GROUP BY v.id
    `, [req.params.productId]);

    // Parse the attributes JSON string for each variant
    const formattedVariants = variants.map(v => ({
      ...v,
      attributes: v.attributes ? JSON.parse(`[${v.attributes}]`) : []
    }));

    res.json(formattedVariants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

// Create/Update variants for a product
router.post('/product/:productId', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { variants } = req.body;
    const productId = req.params.productId;

    // Delete existing variants if specified
    if (req.body.replaceAll) {
      await conn.query('DELETE FROM product_variant WHERE product_id = ?', [productId]);
    }

    // Insert new variants
    const results = await Promise.all(variants.map(async variant => {
      // Insert variant
      const [variantResult] = await conn.query(`
        INSERT INTO product_variant (
          product_id, sku, price, stock, is_active, 
          cost_price, compare_at_price, weight, 
          width, height, length, low_stock_threshold
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        productId, variant.sku, variant.price, variant.stock, 
        variant.is_active, variant.cost_price, variant.compare_at_price,
        variant.weight, variant.width, variant.height, variant.length,
        variant.low_stock_threshold
      ]);

      const variantId = variantResult.insertId;

      // Insert variant attributes
      if (variant.attributes) {
        await Promise.all(Object.entries(variant.attributes).map(([attributeId, valueId]) => 
          conn.query(
            'INSERT INTO variant_attribute_value (variant_id, attribute_id, value_id) VALUES (?, ?, ?)',
            [variantId, attributeId, valueId]
          )
        ));
      }

      return { ...variant, id: variantId };
    }));

    await conn.commit();
    res.json(results);
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

module.exports = router; 