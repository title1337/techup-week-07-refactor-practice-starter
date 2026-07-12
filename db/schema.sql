BEGIN;

DROP TABLE IF EXISTS products;

CREATE TABLE products (
  product_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  stock INT NOT NULL CHECK (stock >= 0),
  internal_cost NUMERIC(10, 2) NOT NULL CHECK (internal_cost >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (name, description, price, category, stock, internal_cost)
VALUES
  ('Mechanical Keyboard', 'Compact keyboard for coding and gaming', 2490.00, 'electronics', 12, 1450.00),
  ('USB-C Hub', 'Hub with HDMI, USB-A, and card reader', 1290.00, 'electronics', 20, 720.00),
  ('Monitor Stand', 'Wooden desk stand for better posture', 890.00, 'workspace', 18, 430.00),
  ('Coffee Beans', 'Medium roast beans from Chiang Rai', 350.00, 'grocery', 40, 180.00);

COMMIT;
