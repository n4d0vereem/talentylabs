import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { collaborations, calendarEvents } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";

/**
 * API Route pour migrer les collaborations existantes
 * Crée automatiquement les événements PREVIEW et PUBLICATION
 * pour toutes les collaborations qui ont des dates définies
 * 
 * Usage: GET /api/migrate-collab-events
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🚀 Démarrage de la migration des événements de collaboration...");

    // Récupérer toutes les collaborations
    const allCollaborations = await db.select().from(collaborations);

    console.log(`📊 ${allCollaborations.length} collaborations trouvées`);

    let previewCount = 0;
    let publicationCount = 0;
    let skippedCount = 0;
    const results = [];

    for (const collab of allCollaborations) {
      const collabResult: any = {
        id: collab.id,
        marque: collab.marque,
        preview: null,
        publication: null,
      };

      // Supprimer les anciens événements liés à cette collaboration (si existants)
      // Support des anciens formats avec majuscules et tiret
      await db
        .delete(calendarEvents)
        .where(
          and(
            eq(calendarEvents.talentId, collab.talentId),
            or(
              eq(calendarEvents.title, `Preview ${collab.marque}`),
              eq(calendarEvents.title, `Publication ${collab.marque}`),
              eq(calendarEvents.title, `PREVIEW - ${collab.marque}`),
              eq(calendarEvents.title, `PUBLICATION - ${collab.marque}`)
            )
          )
        );

      // Créer l'événement PREVIEW si la date existe
      if (collab.datePreview) {
        try {
          const previewDate = new Date(collab.datePreview);
          previewDate.setHours(9, 0, 0, 0); // 9h00 du matin
          
          const previewEnd = new Date(collab.datePreview);
          previewEnd.setHours(9, 30, 0, 0); // 9h30 (30 minutes)

          await db.insert(calendarEvents).values({
            id: `event_preview_${collab.id}_${Date.now()}`,
            talentId: collab.talentId,
            title: `Preview ${collab.marque}`,
            start: previewDate,
            end: previewEnd,
            type: "PREVIEW",
            description: `Preview de la collaboration avec ${collab.marque}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          collabResult.preview = "✅ créé";
          previewCount++;
        } catch (error) {
          collabResult.preview = `⚠️ erreur: ${error}`;
        }
      }

      // Créer l'événement PUBLICATION si la date existe
      if (collab.datePublication) {
        try {
          const pubDate = new Date(collab.datePublication);
          pubDate.setHours(9, 0, 0, 0); // 9h00 du matin
          
          const pubEnd = new Date(collab.datePublication);
          pubEnd.setHours(9, 30, 0, 0); // 9h30 (30 minutes)

          await db.insert(calendarEvents).values({
            id: `event_pub_${collab.id}_${Date.now()}`,
            talentId: collab.talentId,
            title: `Publication ${collab.marque}`,
            start: pubDate,
            end: pubEnd,
            type: "PUBLICATION",
            description: `Publication de la collaboration avec ${collab.marque}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          collabResult.publication = "✅ créé";
          publicationCount++;
        } catch (error) {
          collabResult.publication = `⚠️ erreur: ${error}`;
        }
      }

      if (!collab.datePreview && !collab.datePublication) {
        collabResult.status = "⏭️ aucune date";
        skippedCount++;
      }

      results.push(collabResult);
    }

    return NextResponse.json({
      success: true,
      message: "Migration terminée avec succès",
      stats: {
        total: allCollaborations.length,
        previewCreated: previewCount,
        publicationCreated: publicationCount,
        skipped: skippedCount,
      },
      details: results,
    });

  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to migrate collaboration events",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

