import * as pg from 'pg';

const { Pool } = pg;

const connectionPool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgrespassword@localhost:5432/week7',
});

export default connectionPool;
