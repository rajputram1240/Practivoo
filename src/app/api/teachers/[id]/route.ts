import { connectDB } from "@/utils/db";
import Teacher from "@/models/Teacher";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(
  req: Request,
  context: any
) {
  await connectDB();
  const { id } = context.params;
  const body = await req.json();

  try {
    const updated = await Teacher.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Updated successfully", data: updated },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Update failed", details: error }, { status: 500 });
  }
}


export async function DELETE(
  req: Request,
  context: any
) {
  await connectDB();
  const { id } = context.params;

  try {
    const deleted = await Teacher.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 });
  }
}

