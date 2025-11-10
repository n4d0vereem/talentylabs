import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { collaborations } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST - Reorder collaborations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orders } = body; // Array of { id: string, displayOrder: number }

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json(
        { error: "Invalid orders array" },
        { status: 400 }
      );
    }

    // Update each collaboration's display order
    const updatePromises = orders.map(({ id, displayOrder }) =>
      db
        .update(collaborations)
        .set({ displayOrder, updatedAt: new Date() })
        .where(eq(collaborations.id, id))
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering collaborations:", error);
    return NextResponse.json(
      { error: "Failed to reorder collaborations" },
      { status: 500 }
    );
  }
}


