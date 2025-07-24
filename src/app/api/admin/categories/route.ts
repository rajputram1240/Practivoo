// src/app/api/admin/categories/route.ts

import { connectDB } from "@/utils/db";
import Category from "@/models/Category";
import { NextRequest } from "next/server";

export async function GET() {
  await connectDB();
  const categories = await Category.find();
  return Response.json({ success: true, data: categories });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const { name, subcategories } = await req.json();
  const newCategory = await Category.create({ name, subcategories });
  return Response.json({ success: true, data: newCategory });
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const { id, name, subcategories } = await req.json();

  const updated = await Category.findByIdAndUpdate(
    id,
    { name, subcategories },
    { new: true }
  );

  if (!updated) {
    return new Response(JSON.stringify({ error: "Category not found" }), {
      status: 404,
    });
  }

  return Response.json({ success: true, data: updated });
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { id } = await req.json();
  await Category.findByIdAndDelete(id);
  return Response.json({ success: true });
}