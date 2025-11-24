import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { talentInsights } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET insights for a talent
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

    const insights = await db
      .select()
      .from(talentInsights)
      .where(eq(talentInsights.talentId, talentId))
      .limit(1);

    if (!insights.length) {
      // Return empty insights if not found
      return NextResponse.json({
        instagramFollowers: "",
        instagramEngagement: "",
        instagramAvgLikes: "",
        instagramGrowth: "",
        tiktokFollowers: "",
        tiktokEngagement: "",
        tiktokViews: "",
        snapchatFollowers: "",
        snapchatViews: "",
      });
    }

    return NextResponse.json(insights[0]);
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}

// POST/PUT upsert insights
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { talentId, ...insightsData } = body;

    if (!talentId) {
      return NextResponse.json(
        { error: "talentId is required" },
        { status: 400 }
      );
    }

    // Check if insights already exist
    const existingInsights = await db
      .select()
      .from(talentInsights)
      .where(eq(talentInsights.talentId, talentId))
      .limit(1);

    if (existingInsights.length) {
      // Update existing
      const updatedInsights = await db
        .update(talentInsights)
        .set({
          ...insightsData,
          updatedAt: new Date(),
        })
        .where(eq(talentInsights.talentId, talentId))
        .returning();

      return NextResponse.json(updatedInsights[0]);
    } else {
      // Create new
      const newInsights = await db
        .insert(talentInsights)
        .values({
          id: `insights_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          talentId,
          ...insightsData,
          updatedAt: new Date(),
        })
        .returning();

      return NextResponse.json(newInsights[0], { status: 201 });
    }
  } catch (error) {
    console.error("Error saving insights:", error);
    return NextResponse.json(
      { error: "Failed to save insights" },
      { status: 500 }
    );
  }
}








