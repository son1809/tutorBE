const sequelize = require('./config/db');

async function check() {
  try {
    const [results] = await sequelize.query(`
      SELECT TABLE_NAME, COUNT(INDEX_NAME) as index_count
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = 'tutorconnect'
      GROUP BY TABLE_NAME
      ORDER BY index_count DESC;
    `);
    console.table(results);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();
