import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { talentDocuments } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET all documents for a talent
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

    const documents = await db
      .select()
      .from(talentDocuments)
      .where(eq(talentDocuments.talentId, talentId));

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// POST create new document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { talentId, name, fileUrl } = body;

    if (!talentId || !name || !fileUrl) {
      return NextResponse.json(
        { error: "talentId, name, and fileUrl are required" },
        { status: 400 }
      );
    }

    const newDocument = await db
      .insert(talentDocuments)
      .values({
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        talentId,
        name,
        fileUrl,
        uploadedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newDocument[0], { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}

// DELETE document
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 }
      );
    }

    await db
      .delete(talentDocuments)
      .where(eq(talentDocuments.id, documentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

