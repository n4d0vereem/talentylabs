import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { collaborations, calendarEvents } from "@/db/schema";
import { eq, asc, max, and, or } from "drizzle-orm";

// Helper function to create/update calendar events for a collaboration
async function syncCollaborationEvents(
  collabId: string,
  talentId: string,
  marque: string,
  datePreview: string | null,
  datePublication: string | null
) {
  // Supprimer les anciens événements liés à cette collaboration
  await db
    .delete(calendarEvents)
    .where(
      and(
        eq(calendarEvents.talentId, talentId),
        or(
          eq(calendarEvents.title, `Preview ${marque}`),
          eq(calendarEvents.title, `Publication ${marque}`),
          eq(calendarEvents.title, `PREVIEW - ${marque}`),
          eq(calendarEvents.title, `PUBLICATION - ${marque}`)
        )
      )
    );

  // Créer l'événement PREVIEW si datePreview existe
  if (datePreview) {
    const previewDate = new Date(datePreview);
    previewDate.setHours(9, 0, 0, 0); // 9h00 du matin
    
    const previewEnd = new Date(datePreview);
    previewEnd.setHours(9, 30, 0, 0); // 9h30 (30 minutes)

    await db.insert(calendarEvents).values({
      id: `event_preview_${collabId}_${Date.now()}`,
      talentId,
      title: `Preview ${marque}`,
      start: previewDate,
      end: previewEnd,
      type: "PREVIEW",
      description: `Preview de la collaboration avec ${marque}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Créer l'événement PUBLICATION si datePublication existe
  if (datePublication) {
    const pubDate = new Date(datePublication);
    pubDate.setHours(9, 0, 0, 0); // 9h00 du matin
    
    const pubEnd = new Date(datePublication);
    pubEnd.setHours(9, 30, 0, 0); // 9h30 (30 minutes)

    await db.insert(calendarEvents).values({
      id: `event_pub_${collabId}_${Date.now()}`,
      talentId,
      title: `Publication ${marque}`,
      start: pubDate,
      end: pubEnd,
      type: "PUBLICATION",
      description: `Publication de la collaboration avec ${marque}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

// GET collaborations (filtré par talentId)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const talentId = searchParams.get("talentId");

    if (!talentId) {
      return NextResponse.json(
        { error: "talentId is required" },
        { status: 400 }
      );
    }

    const allCollaborations = await db
      .select()
      .from(collaborations)
      .where(eq(collaborations.talentId, talentId))
      .orderBy(asc(collaborations.displayOrder));

    return NextResponse.json(allCollaborations);
  } catch (error) {
    console.error("Error fetching collaborations:", error);
    return NextResponse.json(
      { error: "Failed to fetch collaborations" },
      { status: 500 }
    );
  }
}

// POST new collaboration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      talentId,
      marque,
      mois,
      contenu,
      datePreview,
      datePublication,
      budget,
      type,
      gestionnaire,
      facture,
      statut,
    } = body;

    // Validation
    if (!talentId || !marque || !mois || !budget || !type || !statut) {
      return NextResponse.json(
        { error: "Missing required fields: talentId, marque, mois, budget, type, statut" },
        { status: 400 }
      );
    }

    // Calculer le prochain displayOrder
    const maxOrderResult = await db
      .select({ maxOrder: max(collaborations.displayOrder) })
      .from(collaborations)
      .where(eq(collaborations.talentId, talentId));
    
    const nextOrder = (maxOrderResult[0]?.maxOrder || 0) + 1;

    const collabId = `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newCollaboration = await db
      .insert(collaborations)
      .values({
        id: collabId,
        talentId,
        marque,
        mois,
        contenu: contenu || "",
        datePreview: datePreview || "",
        datePublication: datePublication || "",
        budget,
        type,
        gestionnaire: gestionnaire || "",
        facture: facture || "",
        statut,
        displayOrder: nextOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Créer automatiquement les événements PREVIEW et PUBLICATION
    await syncCollaborationEvents(
      collabId,
      talentId,
      marque,
      datePreview || null,
      datePublication || null
    );

    return NextResponse.json(newCollaboration[0], { status: 201 });
  } catch (error) {
    console.error("Error creating collaboration:", error);
    return NextResponse.json(
      { error: "Failed to create collaboration" },
      { status: 500 }
    );
  }
}


