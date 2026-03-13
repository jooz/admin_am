const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    const client = await pool.connect();
    console.log('Conectado a la base de datos.');
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('Extension pgvector habilitada correctamente.');
    client.release();
  } catch (error) {
    console.error('Error habilitando pgvector:', error);
  } finally {
    await pool.end();
  }
}

main();
