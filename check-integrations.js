const { db } = require('./lib/db');

async function checkIntegrations() {
  try {
    const integrations = await db`SELECT * FROM integrations`;
    console.log('Integrations in DB:', JSON.stringify(integrations, null, 2));
    
    const users = await db`SELECT id, email FROM users`;
    console.log('Users in DB:', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkIntegrations();
