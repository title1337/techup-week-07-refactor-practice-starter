import express from 'express';
import connectionPool from './utils/db.mjs';
import productsRouter from './routes/products.routes.mjs';

const app = express();
const port = 5011;

app.use(express.json());
app.use('/products', productsRouter);
app.use('/:productId', productsRouter);
function isNonBlankString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function hasValidProductBody(body) {
  return (
    isNonBlankString(body.name) &&
    isNonBlankString(body.description) &&
    isNonBlankString(body.category) &&
    typeof body.price === 'number' &&
    Number.isFinite(body.price) &&
    body.price >= 0 &&
    Number.isInteger(body.stock) &&
    body.stock >= 0
  );
}

app.listen(port, () => {
  console.log(`Practice starter API running at http://localhost:${port}`);
});
