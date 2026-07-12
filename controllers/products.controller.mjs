import connectionPool from '../utils/db.mjs';
import { findAll, findOne } from '../repositories/products.repository.mjs';
import productsRouter from '../routes/products.routes.mjs';
import { publicProductDto } from '../dto/products.dto.mjs';
import { listProducts as listProductsService } from '../services/products.service.mjs';

export async function listProducts(req, res) {
  try {
    const products = await listProductsService();
    return res.status(200).json({ data: products.map(publicProductDto) });
  } catch (error) {
    console.error('[GET /products] database error:', error.message);
    return res.status(500).json({ message: 'Server could not get products' });
  }
}

export async function getByIdProducts(req, res) {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res
        .status(400)
        .json({ message: 'productId must be a positive integer' });
    }
    const products = await findOne(productId);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({ data: products.map(publicProductDto) });
  } catch (error) {
    console.error('[GET /products/:productId] database error:', error.message);
    return res.status(500).json({ message: 'Server could not get product' });
  }
}
