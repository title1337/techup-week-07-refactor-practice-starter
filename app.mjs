import express from 'express';
import connectionPool from './utils/db.mjs';
import productsRouter from './routes/products.routes.mjs';

const app = express();
const port = 5011;

app.use(express.json());
app.use('/products', productsRouter);

app.listen(port, () => {
  console.log(`Practice starter API running at http://localhost:${port}`);
});
