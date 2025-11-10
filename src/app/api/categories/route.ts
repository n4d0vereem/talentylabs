import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { talentCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET all categories for an agency
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

    const allCategories = await db
      .select()
      .from(talentCategories)
      .where(eq(talentCategories.agencyId, agencyId));

    return NextResponse.json(allCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, agencyId } = body;

    if (!name || !agencyId) {
      return NextResponse.json(
        { error: "name and agencyId are required" },
        { status: 400 }
      );
    }

    const newCategory = await db
      .insert(talentCategories)
      .values({
        id: `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        agencyId,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const deletedCategory = await db
      .delete(talentCategories)
      .where(eq(talentCategories.id, id))
      .returning();

    if (!deletedCategory.length) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}



