/**
 * Script de migration pour créer automatiquement les événements PREVIEW et PUBLICATION
 * pour toutes les collaborations existantes qui ont des dates définies.
 * 
 * Usage:
 *   npx tsx scripts/migrate-collab-events.ts
 */

import { db } from "../src/db";
import { collaborations, calendarEvents } from "../src/db/schema";
import { eq, and, or } from "drizzle-orm";

async function migrateCollaborationEvents() {
  console.log("🚀 Démarrage de la migration des événements de collaboration...\n");

  try {
    // Récupérer toutes les collaborations
    const allCollaborations = await db.select().from(collaborations);

    console.log(`📊 ${allCollaborations.length} collaborations trouvées\n`);

    let previewCount = 0;
    let publicationCount = 0;
    let skippedCount = 0;

    for (const collab of allCollaborations) {
      console.log(`\n📌 Traitement: ${collab.marque} (${collab.id})`);

      // Supprimer les anciens événements liés à cette collaboration (si existants)
      await db
        .delete(calendarEvents)
        .where(
          and(
            eq(calendarEvents.talentId, collab.talentId),
            or(
              eq(calendarEvents.title, `PREVIEW - ${collab.marque}`),
              eq(calendarEvents.title, `PUBLICATION - ${collab.marque}`)
            )
          )
        );

      // Créer l'événement PREVIEW si la date existe
      if (collab.datePreview) {
        try {
          const previewDate = new Date(collab.datePreview);
          const previewEnd = new Date(collab.datePreview);
          previewEnd.setHours(23, 59, 59);

          await db.insert(calendarEvents).values({
            id: `event_preview_${collab.id}_${Date.now()}`,
            talentId: collab.talentId,
            title: `PREVIEW - ${collab.marque}`,
            start: previewDate,
            end: previewEnd,
            type: "PREVIEW",
            description: `Preview de la collaboration avec ${collab.marque}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          console.log(`   ✅ Événement PREVIEW créé: ${collab.datePreview}`);
          previewCount++;
        } catch (error) {
          console.log(`   ⚠️  Erreur PREVIEW: ${error}`);
        }
      }

      // Créer l'événement PUBLICATION si la date existe
      if (collab.datePublication) {
        try {
          const pubDate = new Date(collab.datePublication);
          const pubEnd = new Date(collab.datePublication);
          pubEnd.setHours(23, 59, 59);

          await db.insert(calendarEvents).values({
            id: `event_pub_${collab.id}_${Date.now()}`,
            talentId: collab.talentId,
            title: `PUBLICATION - ${collab.marque}`,
            start: pubDate,
            end: pubEnd,
            type: "PUBLICATION",
            description: `Publication de la collaboration avec ${collab.marque}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          console.log(`   ✅ Événement PUBLICATION créé: ${collab.datePublication}`);
          publicationCount++;
        } catch (error) {
          console.log(`   ⚠️  Erreur PUBLICATION: ${error}`);
        }
      }

      if (!collab.datePreview && !collab.datePublication) {
        console.log(`   ⏭️  Aucune date définie - ignoré`);
        skippedCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✨ Migration terminée !");
    console.log("=".repeat(60));
    console.log(`📅 ${previewCount} événements PREVIEW créés`);
    console.log(`📤 ${publicationCount} événements PUBLICATION créés`);
    console.log(`⏭️  ${skippedCount} collaborations ignorées (pas de dates)`);
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Exécuter la migration
migrateCollaborationEvents();

