import { Pool } from 'pg';

const pool:Pool = new Pool({
  user: 'Diego',
  host: 'localhost',
  database: 'app-inventory',
  password: '1234',
  port: 5432,
});

export default pool;