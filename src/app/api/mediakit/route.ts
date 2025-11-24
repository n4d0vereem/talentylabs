import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { mediaKits } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET media kit for a talent
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

    const mediaKit = await db
      .select()
      .from(mediaKits)
      .where(eq(mediaKits.talentId, talentId))
      .limit(1);

    if (!mediaKit.length) {
      return NextResponse.json({ pdfUrl: null });
    }

    return NextResponse.json(mediaKit[0]);
  } catch (error) {
    console.error("Error fetching media kit:", error);
    return NextResponse.json(
      { error: "Failed to fetch media kit" },
      { status: 500 }
    );
  }
}

// POST/PUT upsert media kit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { talentId, pdfUrl } = body;

    if (!talentId || !pdfUrl) {
      return NextResponse.json(
        { error: "talentId and pdfUrl are required" },
        { status: 400 }
      );
    }

    // Check if media kit already exists
    const existingMediaKit = await db
      .select()
      .from(mediaKits)
      .where(eq(mediaKits.talentId, talentId))
      .limit(1);

    if (existingMediaKit.length) {
      // Update existing
      const updatedMediaKit = await db
        .update(mediaKits)
        .set({
          pdfUrl,
          updatedAt: new Date(),
        })
        .where(eq(mediaKits.talentId, talentId))
        .returning();

      return NextResponse.json(updatedMediaKit[0]);
    } else {
      // Create new
      const newMediaKit = await db
        .insert(mediaKits)
        .values({
          id: `mediakit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          talentId,
          pdfUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return NextResponse.json(newMediaKit[0], { status: 201 });
    }
  } catch (error) {
    console.error("Error saving media kit:", error);
    return NextResponse.json(
      { error: "Failed to save media kit" },
      { status: 500 }
    );
  }
}

// DELETE media kit
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const talentId = searchParams.get("talentId");

    if (!talentId) {
      return NextResponse.json(
        { error: "talentId is required" },
        { status: 400 }
      );
    }

    const deletedMediaKit = await db
      .delete(mediaKits)
      .where(eq(mediaKits.talentId, talentId))
      .returning();

    if (!deletedMediaKit.length) {
      return NextResponse.json(
        { error: "Media kit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting media kit:", error);
    return NextResponse.json(
      { error: "Failed to delete media kit" },
      { status: 500 }
    );
  }
}








