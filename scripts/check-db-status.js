require('dotenv').config();
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);

async function checkDatabase() {
  try {
    console.log('\n📊 ÉTAT DE LA BASE DE DONNÉES\n');
    console.log('═'.repeat(80));
    
    // 1. Taille totale de la base de données
    const dbSize = await sql`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `;
    console.log(`\n💾 Taille totale de la base: ${dbSize[0].size}`);
    
    // 2. Liste des tables avec leur taille et nombre de lignes
    const tables = await sql`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `;
    
    console.log('\n📋 TABLES ET LEUR TAILLE:\n');
    console.log('─'.repeat(80));
    
    let totalRows = 0;
    
    for (const table of tables) {
      const countResult = await sql`SELECT COUNT(*) FROM ${sql(table.tablename)}`;
      const count = parseInt(countResult[0].count);
      totalRows += count;
      
      console.log(`\n📁 ${table.tablename}`);
      console.log(`   Taille: ${table.size}`);
      console.log(`   Lignes: ${count}`);
      
      // Pour les tables importantes, montrer un aperçu
      if (count > 0) {
        if (table.tablename === 'user') {
          const users = await sql`SELECT email, name FROM "user"`;
          console.log(`   👤 Utilisateurs:`);
          users.forEach(u => console.log(`      - ${u.email} (${u.name || 'sans nom'})`));
        }
        
        if (table.tablename === 'agencies') {
          const agencies = await sql`SELECT name, owner_id FROM agencies`;
          console.log(`   🏢 Agences:`);
          agencies.forEach(a => console.log(`      - ${a.name}`));
        }
        
        if (table.tablename === 'talents') {
          const talents = await sql`SELECT first_name, last_name FROM talents`;
          console.log(`   ⭐ Talents:`);
          talents.forEach(t => console.log(`      - ${t.first_name} ${t.last_name}`));
        }
        
        if (table.tablename === 'media_kits') {
          const kits = await sql`
            SELECT 
              talent_id, 
              LENGTH(pdf_url) as pdf_size,
              created_at
            FROM media_kits
          `;
          console.log(`   📄 Media Kits:`);
          kits.forEach(k => {
            const sizeMB = (k.pdf_size / 1024 / 1024).toFixed(2);
            console.log(`      - Talent ${k.talent_id.substring(0, 20)}... (${sizeMB} MB)`);
          });
        }
      }
    }
    
    console.log('\n' + '─'.repeat(80));
    console.log(`\n📈 RÉSUMÉ:`);
    console.log(`   Total de lignes dans toutes les tables: ${totalRows}`);
    console.log(`   Nombre de tables: ${tables.length}`);
    
    // 3. Vérifier les connexions actives
    const connections = await sql`
      SELECT count(*) as active_connections
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;
    console.log(`   Connexions actives: ${connections[0].active_connections}`);
    
    // 4. Informations sur le serveur PostgreSQL
    const version = await sql`SELECT version()`;
    const versionShort = version[0].version.split(',')[0];
    console.log(`   Version PostgreSQL: ${versionShort}`);
    
    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ Vérification terminée!\n');
    
    // Avertissement si des tables sont volumineuses
    const largeTables = tables.filter(t => t.size_bytes > 10 * 1024 * 1024); // > 10MB
    if (largeTables.length > 0) {
      console.log('⚠️  ATTENTION - Tables volumineuses détectées:\n');
      largeTables.forEach(t => {
        console.log(`   - ${t.tablename}: ${t.size}`);
      });
      console.log('\n💡 Conseil: Si vous stockez beaucoup de PDFs en base64,');
      console.log('   considérez un stockage externe (S3, Cloudinary, etc.)\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors de la vérification:', error.message);
    process.exit(1);
  }
}

checkDatabase();










