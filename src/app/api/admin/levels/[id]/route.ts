import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Level from "@/models/Level";

// PUT /api/admin/levels/[id]
export async function PUT(req: NextRequest, context: any) {
  await connectDB();

  const { id } = context.params;
  const { code, defaultName } = await req.json();

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
export async function DELETE(req: NextRequest, context: any) {
  await connectDB();

  const { id } = context.params;

  const deleted = await Level.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: "Level not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Level deleted successfully" }, { status: 200 });
}