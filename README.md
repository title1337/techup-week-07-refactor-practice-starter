# Product API Refactor Practice

This is the student starter for the PostgreSQL refactor exercise. The API already works; the goal is to change the code structure without changing what the client sees.

For a guided walkthrough of the first endpoint, open [STEP_BY_STEP.md](STEP_BY_STEP.md) before starting Mission A.

## The Problem We Are Fixing

`app.mjs` currently does many jobs in one file:

```text
choose URL + validate input + run SQL + decide status code + shape JSON
```

For a small demo this can be acceptable. As an API grows, it becomes difficult to find code and easy to accidentally break another endpoint.

Our target is:

```text
Client -> Router -> Controller -> Service -> Repository -> PostgreSQL
```

Each layer has one job:

- Router: chooses the handler for a method and URL.
- Controller: reads HTTP input and returns the HTTP response.
- Service: coordinates the use case.
- Repository: contains SQL and calls the PostgreSQL pool.
- DTO: chooses the fields that may enter or leave the API.

## Before You Start

Run the schema in the `API` database, then start the starter API.

```powershell
npm install
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/API"
psql $env:DATABASE_URL -f db/schema.sql
npm run dev
```

The server runs at `http://localhost:5011`. Use `requests.http` to record the current behavior before moving code.

If `psql` is not available, run `db/schema.sql` in pgAdmin. Do not put a real database password in source code or commit it to Git.

## Important Starting Fact

The starter deliberately returns `internal_cost` and lets the POST body set it. This is not a public API design we want to keep. Your refactor must fix that without changing the public endpoints below.

```text
GET  /products
GET  /products/:productId
POST /products
```

## Mission A — Read Endpoints

Refactor both `GET` endpoints.

1. Create and mount `routes/products.routes.mjs` at `/products`.
2. Move the handlers to `controllers/products.controller.mjs`.
3. Create `repositories/products.repository.mjs` and move every SQL query there.
4. Create `services/products.service.mjs` between controller and repository.
5. Create `dto/products.dto.mjs` with `publicProductDto`.
6. Return only public fields. `internal_cost` must never appear in the response.
7. Keep these results:
   - `GET /products` returns `200`.
   - `GET /products/1` returns `200`.
   - `GET /products/abc` returns `400`.
   - `GET /products/999` returns `404`.

## Mission B — Create Endpoint

Refactor `POST /products` using the same layers.

1. Keep validation at the HTTP boundary. It may stay in a middleware file.
2. Create `createProductDto(req.body)` that allows only `name`, `description`, `price`, `category`, and `stock`.
3. The Repository uses a parameterized `INSERT ... RETURNING` query.
4. Set the new product's `internal_cost` inside server-side code; do not take it from the client.
5. Return `201` and the public product DTO.

Test the POST request that contains both `product_id` and `internal_cost`. Neither value may control the created product.

## Check Yourself Before Comparing the Solution

- Does any Controller contain `connectionPool.query(...)`? If yes, move it to Repository.
- Does any Repository receive `req` or `res`? If yes, pass only simple values such as `productId` or `productInput`.
- Does the output DTO explicitly list public fields rather than spreading the whole database row?
- Do all SQL values from the request use `$1`, `$2`, and a values array?
- Can the same requests still pass after the refactor?

## When You Are Stuck

Trace one request on paper first:

```text
GET /products/1
-> Router chooses controller
-> Controller gets req.productId
-> Service asks Repository for one product
-> Repository runs SELECT with $1
-> Controller returns publicProductDto(product)
```

The complete teacher solution is in `../express-postgres-refactor/`. Do not open it until you have attempted the core mission.
