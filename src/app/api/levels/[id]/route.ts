// File: app/api/levels/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import SchoolLevel from "@/models/SchoolLevel";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();

  const { id } = params;
  const { customName } = await req.json();

  if (!customName) {
    return NextResponse.json({ error: "Missing customName" }, { status: 400 });
  }

  try {
    const updatedLevel = await SchoolLevel.findByIdAndUpdate(
      id,
      { customName },
      { new: true }
    );

    if (!updatedLevel) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Level updated", level: updatedLevel });
  } catch (err) {
    console.error("Update Level Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}