import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { collaborations } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    const deletedCollaboration = await db
      .delete(collaborations)
      .where(eq(collaborations.id, id))
      .returning();

    if (!deletedCollaboration.length) {
      return NextResponse.json(
        { error: "Collaboration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting collaboration:", error);
    return NextResponse.json(
      { error: "Failed to delete collaboration" },
      { status: 500 }
    );
  }
}

