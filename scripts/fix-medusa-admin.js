const path = require('path');
const pgPath = path.resolve(__dirname, '../backend/node_modules/pg');
const { Client } = require(pgPath);

const connectionString = 'postgres://postgres:Fex0VEe7zshO4jFY9yXNblxe9qukwPk20vE6UCWqCHxSl9E2bdvLtbH2KxFzyMo9@140.245.201.144:5432/postgres?sslmode=disable';

async function main() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to Medusa PostgreSQL DB');

    await client.query('TRUNCATE TABLE provider_identity CASCADE');
    await client.query('TRUNCATE TABLE auth_identity CASCADE');
    await client.query('DELETE FROM "user" WHERE email = $1', ['admin@jooka.com']);

    console.log('Successfully truncated auth tables and removed admin@jooka.com');
  } catch (err) {
    console.error('Error modifying DB:', err);
  } finally {
    await client.end();
  }
}

main();
