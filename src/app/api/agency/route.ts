import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { agencies, users } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET agency de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 1. Vérifier si l'utilisateur a un agencyId (collaborateur invité)
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id)
    });

    if (user?.agencyId) {
      // Récupérer l'agence associée
      const agency = await db.query.agencies.findFirst({
        where: eq(agencies.id, user.agencyId)
      });

      if (agency) {
        return NextResponse.json({ agency });
      }
    }

    // 2. Sinon, chercher l'agence dont l'utilisateur est propriétaire
    const userAgencies = await db
      .select()
      .from(agencies)
      .where(eq(agencies.ownerId, session.user.id))
      .limit(1);

    if (userAgencies.length === 0) {
      return NextResponse.json(
        { agency: null },
        { status: 200 }
      );
    }

    return NextResponse.json({ agency: userAgencies[0] });
  } catch (error) {
    console.error("Error fetching user agency:", error);
    return NextResponse.json(
      { error: "Failed to fetch agency" },
      { status: 500 }
    );
  }
}

// POST créer une nouvelle agence pour l'utilisateur connecté
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, logo, primaryColor } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur est un collaborateur invité (a déjà un agencyId)
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id)
    });

    if (user?.agencyId) {
      return NextResponse.json(
        { error: "You are already part of an agency. Cannot create a new one." },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a déjà une agence (en tant que propriétaire)
    const existingAgency = await db
      .select()
      .from(agencies)
      .where(eq(agencies.ownerId, session.user.id))
      .limit(1);

    if (existingAgency.length > 0) {
      return NextResponse.json(
        { error: "User already has an agency" },
        { status: 400 }
      );
    }

    // Créer la nouvelle agence
    const newAgency = await db
      .insert(agencies)
      .values({
        id: `agency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name,
        logo: logo || "",
        primaryColor: primaryColor || "#000000",
        useDefaultColors: true,
        ownerId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Mettre à jour l'agencyId de l'user
    await db.update(users)
      .set({ agencyId: newAgency[0].id })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ agency: newAgency[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating agency:", error);
    return NextResponse.json(
      { error: "Failed to create agency" },
      { status: 500 }
    );
  }
}











