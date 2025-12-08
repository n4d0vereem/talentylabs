/**
 * Script de migration des utilisateurs existants
 * 
 * Ce script met à jour les utilisateurs existants pour leur assigner :
 * - Le rôle ADMIN (pour les propriétaires d'agence)
 * - Le statut ACTIVE
 * - L'agencyId correspondant
 * 
 * Usage : npx tsx scripts/migrate-existing-users.ts
 */

import { db } from '../src/db';
import { users, agencies } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function migrateExistingUsers() {
  console.log('🚀 Début de la migration des utilisateurs existants...\n');
  
  try {
    // 1. Récupérer toutes les agences
    const allAgencies = await db.select().from(agencies);
    
    console.log(`📊 ${allAgencies.length} agence(s) trouvée(s)\n`);
    
    if (allAgencies.length === 0) {
      console.log('⚠️  Aucune agence trouvée. Assurez-vous d\'avoir créé au moins une agence.');
      return;
    }
    
    // 2. Pour chaque agence, mettre à jour le propriétaire
    for (const agency of allAgencies) {
      console.log(`Traitement de l'agence : ${agency.name} (ID: ${agency.id})`);
      
      // Vérifier que l'owner existe
      const owner = await db.query.users.findFirst({
        where: eq(users.id, agency.ownerId)
      });
      
      if (!owner) {
        console.log(`  ❌ Propriétaire introuvable (ID: ${agency.ownerId})`);
        continue;
      }
      
      console.log(`  👤 Propriétaire : ${owner.name || owner.email}`);
      
      // Mettre à jour l'owner comme ADMIN
      await db.update(users)
        .set({
          role: 'ADMIN' as any,
          status: 'ACTIVE' as any,
          agencyId: agency.id,
          updatedAt: new Date()
        })
        .where(eq(users.id, agency.ownerId));
      
      console.log(`  ✅ Migré en ADMIN avec status ACTIVE\n`);
    }
    
    console.log('✨ Migration terminée avec succès !');
    console.log('\n📝 Prochaines étapes :');
    console.log('  1. Vérifiez les données dans Drizzle Studio : npm run db:studio');
    console.log('  2. Testez la connexion avec un compte admin');
    console.log('  3. Créez votre première invitation depuis /dashboard/collaborators');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration :', error);
    process.exit(1);
  }
}

// Exécuter la migration
migrateExistingUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
