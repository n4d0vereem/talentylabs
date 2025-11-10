import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agencies } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET agency settings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agencyId = searchParams.get("agencyId");

    if (!agencyId) {
      return NextResponse.json(
        { error: "agencyId is required" },
        { status: 400 }
      );
    }

    const agency = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, agencyId))
      .limit(1);

    if (!agency.length) {
      return NextResponse.json(
        { error: "Agency not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(agency[0]);
  } catch (error) {
    console.error("Error fetching agency settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch agency settings" },
      { status: 500 }
    );
  }
}

// PUT update agency settings
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agencyId = searchParams.get("agencyId");

    if (!agencyId) {
      return NextResponse.json(
        { error: "agencyId is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Filtrer pour ne garder que les champs modifiables
    const { name, logo, primaryColor, useDefaultColors } = body;

    const updatedAgency = await db
      .update(agencies)
      .set({
        name,
        logo,
        primaryColor,
        useDefaultColors,
        updatedAt: new Date(),
      })
      .where(eq(agencies.id, agencyId))
      .returning();

    if (!updatedAgency.length) {
      return NextResponse.json(
        { error: "Agency not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAgency[0]);
  } catch (error) {
    console.error("Error updating agency settings:", error);
    return NextResponse.json(
      { error: "Failed to update agency settings" },
      { status: 500 }
    );
  }
}

// POST create agency (pour le setup initial)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, logo, primaryColor, useDefaultColors, ownerId } = body;

    if (!name || !ownerId) {
      return NextResponse.json(
        { error: "name and ownerId are required" },
        { status: 400 }
      );
    }

    const newAgency = await db
      .insert(agencies)
      .values({
        id: `agency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        logo: logo || "",
        primaryColor: primaryColor || "#000000",
        useDefaultColors: useDefaultColors ?? true,
        ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newAgency[0], { status: 201 });
  } catch (error) {
    console.error("Error creating agency:", error);
    return NextResponse.json(
      { error: "Failed to create agency" },
      { status: 500 }
    );
  }
}

