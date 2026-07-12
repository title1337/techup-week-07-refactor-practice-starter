import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 5011;

app.use(express.json());

function isNonBlankString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function hasValidProductBody(body) {
  return (
    isNonBlankString(body.name) &&
    isNonBlankString(body.description) &&
    isNonBlankString(body.category) &&
    typeof body.price === "number" &&
    Number.isFinite(body.price) &&
    body.price >= 0 &&
    Number.isInteger(body.stock) &&
    body.stock >= 0
  );
}

app.get("/products", async (req, res) => {
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

app.get("/products/:productId", async (req, res) => {
  const productId = Number(req.params.productId);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ message: "productId must be a positive integer" });
  }

  try {
    const result = await connectionPool.query(
      `
        SELECT product_id, name, description, price, category, stock,
               internal_cost, created_at, updated_at
        FROM products
        WHERE product_id = $1
      `,
      [productId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    console.error("[GET /products/:productId] database error:", error.message);
    return res.status(500).json({ message: "Server could not get product" });
  }
});

app.post("/products", async (req, res) => {
  if (!hasValidProductBody(req.body)) {
    return res.status(400).json({ message: "Invalid product body" });
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
    console.error("[POST /products] database error:", error.message);
    return res.status(500).json({ message: "Server could not create product" });
  }
});

app.listen(port, () => {
  console.log(`Practice starter API running at http://localhost:${port}`);
});
