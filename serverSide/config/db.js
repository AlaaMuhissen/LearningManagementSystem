import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,  // accepts self-signed certs
    checkServerIdentity: () => undefined,  // skips hostname check
  }
});

pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL (Aiven)');
    client.release();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
  });

export default pool;