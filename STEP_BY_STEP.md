# Step-by-Step: Refactor `GET /products`

Follow this guide in order. After every step, save the files and send `GET /products` from `requests.http`. A refactor is safe only when the API still works after each small change.

This guide completes the first endpoint together. Then use the same pattern for `GET /products/:productId` and `POST /products` in the practice mission.

## Before Refactoring

Run the starter and make one baseline request:

```powershell
npm install
npm run dev
```

```http
GET http://localhost:5011/products
```

At this point, `app.mjs` knows the URL, runs SQL, and builds the JSON response. It also returns `internal_cost`. The endpoint works, but it has too many responsibilities.

## Step 1: Create the Router File

Create a `routes` folder. Inside it, create `products.routes.mjs`.

```js
import { Router } from "express";

const router = Router();

export default router;
```

`Router()` creates a smaller Express application for one resource. This router will own URLs related to products.

## Step 2: Mount the Router in `app.mjs`

In `app.mjs`, add this import below the Express import:

```js
import productsRouter from "./routes/products.routes.mjs";
```

After `app.use(express.json())`, mount the router:

```js
app.use("/products", productsRouter);
```

The mount path is the first part of every URL in this router. The old `app.get("/products", ...)` is still in `app.mjs`, so `GET /products` keeps working for now. Express tries the mounted Router first; because it has no matching route yet, it continues to the old handler.

## Step 3: Move `GET /products` into the Router

Cut the whole `app.get("/products", ...)` block from `app.mjs`.

In `routes/products.routes.mjs`, add the database import and paste that route block before `export default router`.

Change only these two things in the pasted route:

```js
app.get("/products", async (req, res) => {
```

becomes:

```js
router.get("/", async (req, res) => {
```

Also add this import at the top of the Router file:

```js
import connectionPool from "../utils/db.mjs";
```

The final router file for this step is:

```js
import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const result = await connectionPool.query(`
      SELECT product_id, name, description, price, category, stock,
             internal_cost, created_at, updated_at
      FROM products
      ORDER BY product_id ASC
    `);

    return res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error("[GET /products] database error:", error.message);
    return res.status(500).json({ message: "Server could not get products" });
  }
});

export default router;
```

Why is the path `/` now? Express combines the mount path and Router path:

```text
app.use("/products", productsRouter)
router.get("/", ...)
--------------------------------
GET /products
```

Do not write `router.get("/products", ...)`; that would create `GET /products/products`.

Test now:

```http
GET http://localhost:5011/products
```

The response should be the same as before. At this stage, `internal_cost` is still visible. Router only moved the endpoint; it has not changed the API contract yet.

## Step 4: Move the Handler into a Controller

Create a `controllers` folder and add `controllers/products.controller.mjs`.

```js
import connectionPool from "../utils/db.mjs";

export async function listProducts(req, res) {
  try {
    const result = await connectionPool.query(`
      SELECT product_id, name, description, price, category, stock,
             internal_cost, created_at, updated_at
      FROM products
      ORDER BY product_id ASC
    `);

    return res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error("[GET /products] database error:", error.message);
    return res.status(500).json({ message: "Server could not get products" });
  }
}
```

Then replace the Router file with:

```js
import { Router } from "express";
import { listProducts } from "../controllers/products.controller.mjs";

const router = Router();

router.get("/", listProducts);

export default router;
```

The Router is now thin: it only answers “which handler runs for this URL?” The Controller still has SQL temporarily, so the next step is to move SQL out.

Test `GET /products` again.

## Step 5: Move SQL into a Repository

Create a `repositories` folder and add `repositories/products.repository.mjs`.

```js
import connectionPool from "../utils/db.mjs";

export async function findAll() {
  const result = await connectionPool.query(`
    SELECT product_id, name, description, price, category, stock,
           internal_cost, created_at, updated_at
    FROM products
    ORDER BY product_id ASC
  `);

  return result.rows;
}
```

Now replace the Controller file with:

```js
import { findAll } from "../repositories/products.repository.mjs";

export async function listProducts(req, res) {
  try {
    const products = await findAll();
    return res.status(200).json({ data: products });
  } catch (error) {
    console.error("[GET /products] error:", error.message);
    return res.status(500).json({ message: "Server could not get products" });
  }
}
```

The Controller knows HTTP. The Repository knows PostgreSQL and SQL. This separation means a Controller does not need to know table names or `$1` placeholders.

Test `GET /products` again.

## Step 6: Add a Service Layer

For this read endpoint, the Service is small. That is normal. It gives us a named place for product use-case rules when the app grows.

Create a `services` folder and add `services/products.service.mjs`.

```js
import { findAll } from "../repositories/products.repository.mjs";

export function listProducts() {
  return findAll();
}
```

Replace the Controller file with:

```js
import { listProducts as listProductsService } from "../services/products.service.mjs";

export async function listProducts(req, res) {
  try {
    const products = await listProductsService();
    return res.status(200).json({ data: products });
  } catch (error) {
    console.error("[GET /products] error:", error.message);
    return res.status(500).json({ message: "Server could not get products" });
  }
}
```

Test `GET /products` again. The response should still be exactly the same.

## Step 7: Add an Output DTO

The database row includes `internal_cost`, but a public product response must not. A DTO is an allow-list: it explicitly chooses the fields that leave the API.

Create a `dto` folder and add `dto/products.dto.mjs`.

```js
export function publicProductDto(product) {
  return {
    product_id: product.product_id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    stock: product.stock,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
}
```

Then replace the Controller file with:

```js
import { publicProductDto } from "../dto/products.dto.mjs";
import { listProducts as listProductsService } from "../services/products.service.mjs";

export async function listProducts(req, res) {
  try {
    const products = await listProductsService();
    return res.status(200).json({
      data: products.map(publicProductDto),
    });
  } catch (error) {
    console.error("[GET /products] error:", error.message);
    return res.status(500).json({ message: "Server could not get products" });
  }
}
```

Send `GET /products` once more. It should return `200`, but `internal_cost` must now be absent.

## What You Have Finished

```text
GET /products
-> productsRouter
-> listProducts controller
-> listProducts service
-> findAll repository
-> PostgreSQL
-> publicProductDto
-> JSON response
```

The endpoint URL did not change. The code responsibility changed.

## Apply the Same Pattern Next

1. Refactor `GET /products/:productId`.
   - Put id validation in middleware.
   - Add `findById(productId)` to Repository.
   - Return `400` for an invalid id and `404` for an absent row.
2. Refactor `POST /products`.
   - Add `createProductDto(body)` for allowed input fields.
   - Add `create(productInput)` to Repository.
   - Never use `req.body.internal_cost` or `req.body.product_id` in the Repository.

Use [README.md](README.md) for the full practice requirements. Compare with the teacher solution only after attempting those two endpoints.
