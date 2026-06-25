const mysql = require('mysql2/promise');

async function reset() {
  try {
    console.log('Connecting to mysql...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });
    
    console.log('Dropping database tutorconnect...');
    await connection.query('DROP DATABASE IF EXISTS tutorconnect;');
    console.log('Creating database tutorconnect...');
    await connection.query('CREATE DATABASE tutorconnect;');
    console.log('Done.');
    await connection.end();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

reset();
