import { connectDB } from "@/utils/db";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const { name, subcategories } = await req.json();

  const updated = await Category.findByIdAndUpdate(
    params.id,
    { name, subcategories },
    { new: true }
  );

  if (!updated) return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const deleted = await Category.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Category deleted" });
}