import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { talents } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET all talents
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

    const allTalents = await db
      .select()
      .from(talents)
      .where(eq(talents.agencyId, agencyId));

    return NextResponse.json(allTalents);
  } catch (error) {
    console.error("Error fetching talents:", error);
    return NextResponse.json(
      { error: "Failed to fetch talents" },
      { status: 500 }
    );
  }
}

// POST new talent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      firstName,
      lastName,
      birthDate,
      category,
      topSize,
      bottomSize,
      shoeSize,
      foodIntolerances,
      address,
      phone,
      email,
      bio,
      location,
      image,
      instagram,
      tiktok,
      snapchat,
      instagramData,
      agencyId,
    } = body;

    // Validation
    if (!firstName || !lastName || !agencyId) {
      return NextResponse.json(
        { error: "firstName, lastName, and agencyId are required" },
        { status: 400 }
      );
    }

    // Create talent
    const newTalent = await db
      .insert(talents)
      .values({
        id: `talent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        firstName,
        lastName,
        birthDate: birthDate || "",
        category: category || "",
        topSize: topSize || "",
        bottomSize: bottomSize || "",
        shoeSize: shoeSize || "",
        foodIntolerances: foodIntolerances || "",
        address: address || "",
        phone: phone || "",
        email: email || "",
        bio: bio || "",
        location: location || "",
        image: image || "",
        instagram: instagram || "",
        tiktok: tiktok || "",
        snapchat: snapchat || "",
        instagramData: instagramData || null,
        agencyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newTalent[0], { status: 201 });
  } catch (error) {
    console.error("Error creating talent:", error);
    return NextResponse.json(
      { error: "Failed to create talent" },
      { status: 500 }
    );
  }
}



