const pool = require('./connection');

async function getActiveCart(userId) {
  const [carts] = await pool.query(
    'SELECT * FROM cart WHERE user_id = ? AND status = "active" LIMIT 1',
    [userId]
  );
  
  if (carts.length === 0) {
    const [result] = await pool.query(
      'INSERT INTO cart (user_id, status) VALUES (?, "active")',
      [userId]
    );
    return { id: result.insertId, user_id: userId, status: 'active' };
  }
  
  return carts[0];
}

async function getCartItems(cartId) {
  const [items] = await pool.query(`
    SELECT 
      ci.*,
      p.name,
      p.description,
      COALESCE(pv.price, p.price) as price,
      COALESCE(pv.stock, p.stock) as stock,
      pv.id as variant_id,
      (
        SELECT JSON_OBJECTAGG(a.code, va.value)
        FROM variant_attribute va
        JOIN attribute a ON va.attribute_id = a.id
        WHERE va.variant_id = pv.id
      ) as variant_attributes,
      (SELECT url FROM product_image WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image,
      (ci.quantity * ci.price_at_time) as subtotal
    FROM cart_item ci
    JOIN product p ON ci.product_id = p.id
    LEFT JOIN product_variant pv ON ci.variant_id = pv.id
    WHERE ci.cart_id = ?
  `, [cartId]);
  
  return items;
}

async function addToCart(cartId, variantId, quantity) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    // Get variant with product info
    const [variants] = await conn.query(`
      SELECT 
        v.*,
        p.name as product_name,
        p.is_active as product_active
      FROM product_variant v
      JOIN product p ON v.product_id = p.id
      WHERE v.id = ? AND v.is_active = 1 AND p.is_active = 1
    `, [variantId]);

    if (variants.length === 0) {
      throw new Error('Variant not found or inactive');
    }

    const variant = variants[0];
    
    // Check stock
    if (variant.stock < quantity) {
      throw new Error('Not enough stock available');
    }

    // Check for existing cart item
    const [existing] = await conn.query(
      'SELECT id, quantity FROM cart_item WHERE cart_id = ? AND variant_id = ?',
      [cartId, variantId]
    );
    
    if (existing.length > 0) {
      // Update existing cart item
      const newQuantity = existing[0].quantity + quantity;
      if (variant.stock < newQuantity) {
        throw new Error('Not enough stock available');
      }
      
      await conn.query(
        'UPDATE cart_item SET quantity = ?, price_at_time = ? WHERE id = ?',
        [newQuantity, variant.price, existing[0].id]
      );
    } else {
      // Insert new cart item
      await conn.query(
        'INSERT INTO cart_item (cart_id, variant_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
        [cartId, variantId, quantity, variant.price]
      );
    }
    
    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getCart(cartId) {
  const conn = await pool.getConnection();
  try {
    // Get cart items with product and variant info
    const [items] = await conn.query(`
      SELECT 
        ci.*,
        p.name as product_name,
        p.description as product_description,
        v.sku,
        GROUP_CONCAT(
          CONCAT(a.name, ': ', av.value)
          ORDER BY a.display_order
          SEPARATOR ', '
        ) as variant_attributes,
        (SELECT url FROM product_image WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image_url
      FROM cart_item ci
      JOIN product_variant v ON ci.variant_id = v.id
      JOIN product p ON v.product_id = p.id
      LEFT JOIN variant_attribute_value vav ON v.id = vav.variant_id
      LEFT JOIN attribute a ON vav.attribute_id = a.id
      LEFT JOIN attribute_value av ON vav.value_id = av.id
      WHERE ci.cart_id = ?
      GROUP BY ci.id
    `, [cartId]);

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0);
    
    return {
      items,
      subtotal,
      total: subtotal // Add tax/shipping calculation later
    };
  } finally {
    conn.release();
  }
}

module.exports = {
  getActiveCart,
  getCartItems,
  addToCart,
  getCart
}; 