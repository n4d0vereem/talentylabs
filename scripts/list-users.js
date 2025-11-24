require('dotenv').config();
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);

sql`SELECT email, name, id FROM "user"`
  .then(users => {
    console.log('\n📋 UTILISATEURS:\n');
    users.forEach(u => {
      console.log(`📧 ${u.email}`);
      console.log(`👤 ${u.name || '(pas de nom)'}`);
      console.log('---');
    });
    console.log('');
    process.exit(0);
  })
  .catch(err => {
    console.error('Erreur:', err.message);
    process.exit(1);
  });







