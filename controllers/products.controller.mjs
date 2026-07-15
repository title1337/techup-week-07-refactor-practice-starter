import { publicProductDto, createProductDto } from '../dto/products.dto.mjs';
import { listProducts as listProductsService } from '../services/products.service.mjs';
import { getByIdProducts as getByIdProductsService } from '../services/products.service.mjs';
import { buildProduct as buildProductService } from '../services/products.service.mjs';

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

    const products = await getByIdProductsService(productId);

    if (!products) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({ data: publicProductDto(products) });
  } catch (error) {
    console.error('[GET /products/:productId] database error:', error.message);
    return res.status(500).json({ message: 'Server could not get product' });
  }
}

export async function buildProduct(req, res) {
  try {
    const productInput = createProductDto(req.body);
    const product = await buildProductService(productInput);

    return res.status(201).json({ data: publicProductDto(product) });
  } catch (error) {
    console.error('[POST /products] database error:', error.message);
    return res.status(500).json({ message: 'Server could not create product' });
  }
}
