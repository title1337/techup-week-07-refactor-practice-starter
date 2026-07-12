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
export async function createProduct(productInput) {
  const result = await connectionPool.query(
    `
      INSERT INTO products (name, description, price, category, stock, internal_cost)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING product_id, name, description, price, category, stock,
                internal_cost, created_at, updated_at
    `,
    [
      productInput.name,
      productInput.description,
      productInput.price,
      productInput.category,
      productInput.stock,
      productInput.internalCost,
    ],
  );

  return result.rows[0];
}
