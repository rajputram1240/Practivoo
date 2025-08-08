import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Issue from "@/models/Issue";
import mongoose from "mongoose";

export async function PATCH(req: NextRequest, context: any) {
  try {
    await connectDB();
     const { id } = context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const updates: Record<string, any> = {};
    if (body.status) updates.status = body.status;
    if (body.message !== undefined) updates.message = String(body.message).slice(0, 1000);
    if (body.type) updates.type = String(body.type).slice(0, 100);

    const updated = await Issue.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PATCH /api/issues/[id] error", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}


export async function DELETE(_req: Request, context: any) {
  await connectDB();
 const { id } = context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
  }
  const deleted = await Issue.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}