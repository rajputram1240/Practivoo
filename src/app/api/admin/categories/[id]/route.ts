import { connectDB } from "@/utils/db";
import Category from "@/models/Category";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, context: any) {
  await connectDB();
  const { id } = context.params;
  const { name, subcategories } = await req.json();

  const updated = await Category.findByIdAndUpdate(
    id,
    { name, subcategories },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req: NextRequest, context: any) {
  await connectDB();
  const { id } = context.params;

  const deleted = await Category.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Category deleted" });
}