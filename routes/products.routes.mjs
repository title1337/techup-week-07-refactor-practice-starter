import { Router } from 'express';
import connectionPool from '../utils/db.mjs';
import {
  listProducts,
  getByIdProducts,
  buildProduct,
} from '../controllers/products.controller.mjs';

const productsRouter = Router();

productsRouter.get('/', listProducts);

productsRouter.get('/:productId', getByIdProducts);

productsRouter.post('/', buildProduct);

export default productsRouter;
