import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { collaborations, calendarEvents } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";

// Helper function to sync calendar events for a collaboration
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

// GET single collaboration
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collaboration = await db
      .select()
      .from(collaborations)
      .where(eq(collaborations.id, id))
      .limit(1);

    if (!collaboration.length) {
      return NextResponse.json(
        { error: "Collaboration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(collaboration[0]);
  } catch (error) {
    console.error("Error fetching collaboration:", error);
    return NextResponse.json(
      { error: "Failed to fetch collaboration" },
      { status: 500 }
    );
  }
}

// PUT update collaboration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedCollaboration = await db
      .update(collaborations)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(collaborations.id, id))
      .returning();

    if (!updatedCollaboration.length) {
      return NextResponse.json(
        { error: "Collaboration not found" },
        { status: 404 }
      );
    }

    // Synchroniser les événements si les dates ont changé
    const collab = updatedCollaboration[0];
    await syncCollaborationEvents(
      collab.id,
      collab.talentId,
      collab.marque,
      collab.datePreview || null,
      collab.datePublication || null
    );

    return NextResponse.json(updatedCollaboration[0]);
  } catch (error) {
    console.error("Error updating collaboration:", error);
    return NextResponse.json(
      { error: "Failed to update collaboration" },
      { status: 500 }
    );
  }
}

// DELETE collaboration
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Récupérer la collaboration avant de la supprimer pour connaître talentId et marque
    const collabToDelete = await db
      .select()
      .from(collaborations)
      .where(eq(collaborations.id, id))
      .limit(1);

    if (!collabToDelete.length) {
      return NextResponse.json(
        { error: "Collaboration not found" },
        { status: 404 }
      );
    }

    const collab = collabToDelete[0];

    // Supprimer les événements associés
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

    // Supprimer la collaboration
    await db
      .delete(collaborations)
      .where(eq(collaborations.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting collaboration:", error);
    return NextResponse.json(
      { error: "Failed to delete collaboration" },
      { status: 500 }
    );
  }
}

