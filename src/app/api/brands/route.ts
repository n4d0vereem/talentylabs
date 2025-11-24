import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { brands } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET all brands for an agency
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

    const allBrands = await db
      .select()
      .from(brands)
      .where(eq(brands.agencyId, agencyId));

    return NextResponse.json(allBrands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

// POST new brand
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, logo, initials, agencyId } = body;

    if (!name || !initials || !agencyId) {
      return NextResponse.json(
        { error: "name, initials, and agencyId are required" },
        { status: 400 }
      );
    }

    const newBrand = await db
      .insert(brands)
      .values({
        id: `brand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        logo: logo || "",
        initials,
        agencyId,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(newBrand[0], { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}








