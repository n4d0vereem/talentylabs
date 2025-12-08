import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { talents } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { requireAuth, getAccessibleTalentIds } from "@/lib/auth-middleware";

// GET all talents (filtrés selon le rôle)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    
    // Récupérer les IDs des talents accessibles selon le rôle
    const accessibleTalentIds = await getAccessibleTalentIds(
      currentUser.id,
      currentUser.role,
      currentUser.agencyId
    );
    
    if (accessibleTalentIds.length === 0) {
      return NextResponse.json({ success: true, talents: [] });
    }
    
    // Filtrer les talents
    const allTalents = await db
      .select()
      .from(talents)
      .where(inArray(talents.id, accessibleTalentIds));

    return NextResponse.json({ success: true, talents: allTalents });
  } catch (error: any) {
    console.error("Error fetching talents:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch talents" },
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
      addressComplement,
      addressSecondary,
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
        addressComplement: addressComplement || "",
        addressSecondary: addressSecondary || "",
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








