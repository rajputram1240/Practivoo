// File: src/app/api/admin/levels/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Level from "@/models/Level";

export async function GET() {
  await connectDB();
  const levels = await Level.find().sort({ code: 1 });
  return NextResponse.json({ levels }, { status: 200 });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const { code, defaultName, createdBy } = body;

  if (!code || !defaultName) {
    return NextResponse.json({ error: "code and defaultName are required" }, { status: 400 });
  }

  const exists = await Level.findOne({ code });
  if (exists) {
    return NextResponse.json({ error: "Level with this code already exists" }, { status: 409 });
  }

  const level = await Level.create({
    code,
    defaultName,
    createdBy: createdBy || "admin",
  });

  return NextResponse.json({ level }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const { id, code, defaultName } = body;

  if (!id || !code || !defaultName) {
    return NextResponse.json({ error: "id, code, and defaultName are required" }, { status: 400 });
  }

  const updated = await Level.findByIdAndUpdate(
    id,
    { code, defaultName },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json({ error: "Level not found" }, { status: 404 });
  }

  return NextResponse.json({ level: updated }, { status: 200 });
}

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

  return NextResponse.json({ message: "Level deleted successfully" }, { status: 200 });
}