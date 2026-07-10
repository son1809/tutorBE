const sequelize = require('./config/db');

async function clean() {
  try {
    for (const table of ['users', 'payments']) {
      const [indices] = await sequelize.query(`SHOW INDEXES FROM ${table}`);
      
      const indexNames = indices
        .map(i => i.Key_name)
        .filter(name => name !== 'PRIMARY' && name !== 'email'); // keep primary and unique
      
      // Deduplicate names
      const uniqueNames = [...new Set(indexNames)];

      console.log(`Dropping ${uniqueNames.length} indices from ${table}...`);
      
      for (const name of uniqueNames) {
        try {
          await sequelize.query(`ALTER TABLE ${table} DROP INDEX \`${name}\``);
        } catch (e) {
          // ignore error if index already dropped or foreign key constraint fails
        }
      }
    }
    console.log('Cleanup done!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
clean();
