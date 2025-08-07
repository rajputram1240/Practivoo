import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Level from "@/models/Level";

// GET: Fetch all levels
export async function GET() {
  await connectDB();
  const levels = await Level.find().sort({ code: 1 });
  return NextResponse.json({ levels }, { status: 200 });
}

// POST: Create a new level (auto-generate code from defaultName)
export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const { defaultName, createdBy } = body;

  if (!defaultName || defaultName.trim() === "") {
    return NextResponse.json(
      { error: "defaultName is required" },
      { status: 400 }
    );
  }

  // Auto-generate code from defaultName
  const code = defaultName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");

  const exists = await Level.findOne({ code });
  if (exists) {
    return NextResponse.json(
      { error: "Level with this code already exists" },
      { status: 409 }
    );
  }

  const level = await Level.create({
    code,
    defaultName,
    createdBy: createdBy || "admin",
  });

  return NextResponse.json({ level }, { status: 201 });
}

// PATCH: Update defaultName only (not code)
export async function PATCH(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const { id, defaultName } = body;

  if (!id || !defaultName) {
    return NextResponse.json(
      { error: "id and defaultName are required" },
      { status: 400 }
    );
  }

  const updated = await Level.findByIdAndUpdate(
    id,
    { defaultName },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json({ error: "Level not found" }, { status: 404 });
  }

  return NextResponse.json({ level: updated }, { status: 200 });
}

// DELETE: Delete level by ID
export async function DELETE(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const deleted = await Level.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Level not found" }, { status: 404 });
  }

  return NextResponse.json(
    { message: "Level deleted successfully" },
    { status: 200 }
  );
}