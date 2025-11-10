import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { talents } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET single talent
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const talent = await db
      .select()
      .from(talents)
      .where(eq(talents.id, id))
      .limit(1);

    if (!talent.length) {
      return NextResponse.json(
        { error: "Talent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(talent[0]);
  } catch (error) {
    console.error("Error fetching talent:", error);
    return NextResponse.json(
      { error: "Failed to fetch talent" },
      { status: 500 }
    );
  }
}

// PUT update talent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedTalent = await db
      .update(talents)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(talents.id, id))
      .returning();

    if (!updatedTalent.length) {
      return NextResponse.json(
        { error: "Talent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTalent[0]);
  } catch (error) {
    console.error("Error updating talent:", error);
    return NextResponse.json(
      { error: "Failed to update talent" },
      { status: 500 }
    );
  }
}

// DELETE talent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedTalent = await db
      .delete(talents)
      .where(eq(talents.id, id))
      .returning();

    if (!deletedTalent.length) {
      return NextResponse.json(
        { error: "Talent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting talent:", error);
    return NextResponse.json(
      { error: "Failed to delete talent" },
      { status: 500 }
    );
  }
}

