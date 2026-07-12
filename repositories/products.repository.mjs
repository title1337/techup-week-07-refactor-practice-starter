import connectionPool from '../utils/db.mjs';

export async function findAll() {
  const result = await connectionPool.query(`
    SELECT product_id, name, description, price, category, stock,
           internal_cost, created_at, updated_at
    FROM products
    ORDER BY product_id ASC
  `);

  return result.rows;
}

export async function findOne(productId) {
  const result = await connectionPool.query(
    `
        SELECT product_id, name, description, price, category, stock,
               internal_cost, created_at, updated_at
        FROM products
        WHERE product_id = $1
      `,
    [productId],
  );
  return result.rows;
}
