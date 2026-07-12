import { Router } from 'express';
import connectionPool from '../utils/db.mjs';
import { listProducts } from '../controllers/products.controller.mjs';
import { getByIdProducts } from '../controllers/products.controller.mjs';

const productsRouter = Router();

productsRouter.get('/', listProducts);

productsRouter.get('/:productId', getByIdProducts);

productsRouter.post('/', async (req, res) => {
  if (!hasValidProductBody(req.body)) {
    return res.status(400).json({ message: 'Invalid product body' });
  }

  try {
    const result = await connectionPool.query(
      `
        INSERT INTO products (name, description, price, category, stock, internal_cost)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING product_id, name, description, price, category, stock,
                  internal_cost, created_at, updated_at
      `,
      [
        req.body.name.trim(),
        req.body.description.trim(),
        req.body.price,
        req.body.category.trim(),
        req.body.stock,
        req.body.internal_cost ?? 0,
      ],
    );

    return res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('[POST /products] database error:', error.message);
    return res.status(500).json({ message: 'Server could not create product' });
  }
});

export default productsRouter;
