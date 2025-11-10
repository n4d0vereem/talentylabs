import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { calendarEvents } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET events (filtré par talentId)
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

    const allEvents = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.talentId, talentId));

    return NextResponse.json(allEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      talentId,
      title,
      start,
      end,
      type,
      description,
      location,
      document,
      photo,
      link,
    } = body;

    // Validation
    if (!talentId || !title || !start || !end || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newEvent = await db
      .insert(calendarEvents)
      .values({
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        talentId,
        title,
        start: new Date(start),
        end: new Date(end),
        type,
        description: description || "",
        location: location || "",
        document: document || "",
        photo: photo || "",
        link: link || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newEvent[0], { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}



