import { Router } from 'express';
import connectionPool from '../utils/db.mjs';
import {
  listProducts,
  getByIdProducts,
  buildProduct,
} from '../controllers/products.controller.mjs';
import { validateProductBody } from '../middlewares/products.validate.mjs';

const productsRouter = Router();

productsRouter.get('/', listProducts);

productsRouter.get('/:productId', getByIdProducts);

productsRouter.post('/', validateProductBody, buildProduct);

export default productsRouter;
