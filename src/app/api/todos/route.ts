import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { talentTodos } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET all todos for a talent
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

    const todos = await db
      .select()
      .from(talentTodos)
      .where(eq(talentTodos.talentId, talentId));

    return NextResponse.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

// POST create new todo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { talentId, text, deadline } = body;

    if (!talentId || !text) {
      return NextResponse.json(
        { error: "talentId and text are required" },
        { status: 400 }
      );
    }

    const newTodo = await db
      .insert(talentTodos)
      .values({
        id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        talentId,
        text,
        deadline: deadline || null,
        completed: false,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newTodo[0], { status: 201 });
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}

// PATCH update todo (toggle completed, archive, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { todoId, completed, archived } = body;

    if (!todoId) {
      return NextResponse.json(
        { error: "todoId is required" },
        { status: 400 }
      );
    }

    const updateData: any = { updatedAt: new Date() };
    if (typeof completed === "boolean") updateData.completed = completed;
    if (typeof archived === "boolean") updateData.archived = archived;

    const updatedTodo = await db
      .update(talentTodos)
      .set(updateData)
      .where(eq(talentTodos.id, todoId))
      .returning();

    return NextResponse.json(updatedTodo[0]);
  } catch (error) {
    console.error("Error updating todo:", error);
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

// DELETE todo
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const todoId = searchParams.get("todoId");

    if (!todoId) {
      return NextResponse.json(
        { error: "todoId is required" },
        { status: 400 }
      );
    }

    await db
      .delete(talentTodos)
      .where(eq(talentTodos.id, todoId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}

