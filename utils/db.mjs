import * as pg from "pg";

const { Pool } = pg;

const connectionPool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://postgres:P@ssword@1234!@localhost:5432/hh-api",
});

export default connectionPool;
