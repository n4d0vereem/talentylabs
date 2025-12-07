import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { calendarEvents } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

// GET /api/calendar?talentId=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const talentId = searchParams.get("talentId");

    if (!talentId) {
      return NextResponse.json({ error: "talentId is required" }, { status: 400 });
    }

    const events = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.talentId, talentId))
      .orderBy(asc(calendarEvents.start));

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 });
  }
}

// POST /api/calendar
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { talentId, title, start, end, type, description, location, document, photo, link } = body;

    if (!talentId || !title || !start || !end || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newEvent = await db
      .insert(calendarEvents)
      .values({
        id: crypto.randomUUID(),
        talentId,
        title,
        start: new Date(start),
        end: new Date(end),
        type,
        description: description || null,
        location: location || null,
        document: document || null,
        photo: photo || null,
        link: link || null,
      })
      .returning();

    return NextResponse.json(newEvent[0], { status: 201 });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json({ error: "Failed to create calendar event" }, { status: 500 });
  }
}

// DELETE /api/calendar?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));

    return NextResponse.json({ message: "Calendar event deleted" });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return NextResponse.json({ error: "Failed to delete calendar event" }, { status: 500 });
  }
}

