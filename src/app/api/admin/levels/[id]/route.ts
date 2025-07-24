// File: src/app/api/admin/levels/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Level from "@/models/Level";

// PUT /api/admin/levels/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();

  const { id } = params;
  const body = await req.json();
  const { code, defaultName } = body;

  if (!code || !defaultName) {
    return NextResponse.json({ error: "code and defaultName are required" }, { status: 400 });
  }

  const level = await Level.findByIdAndUpdate(
    id,
    { code, defaultName },
    { new: true }
  );

  if (!level) {
    return NextResponse.json({ error: "Level not found" }, { status: 404 });
  }

  return NextResponse.json({ level }, { status: 200 });
}

// DELETE /api/admin/levels/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();

  const { id } = params;

  const deleted = await Level.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: "Level not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Level deleted successfully" }, { status: 200 });
}