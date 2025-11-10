import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { collaborations } from "@/db/schema";
import { eq, asc, max } from "drizzle-orm";

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

    const newCollaboration = await db
      .insert(collaborations)
      .values({
        id: `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

    return NextResponse.json(newCollaboration[0], { status: 201 });
  } catch (error) {
    console.error("Error creating collaboration:", error);
    return NextResponse.json(
      { error: "Failed to create collaboration" },
      { status: 500 }
    );
  }
}


