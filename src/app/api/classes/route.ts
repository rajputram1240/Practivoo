import { connectDB } from "@/utils/db";
import Class from "@/models/Class";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";


export async function POST(req: NextRequest) {
  await connectDB();
  const { name, levelCode, teacher, schoolId } = await req.json();

  if (!name || !levelCode || !schoolId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const newClass = await Class.create({
    name,
    level: levelCode, // level: defaultName, need correction from A1_plus to A1+
    teachers: teacher || [],
    school: schoolId,
  });

  return NextResponse.json(newClass, { status: 201 });
}

export async function GET(req: NextRequest) {
  await connectDB();

  const level = req.nextUrl.searchParams.get("level");
  const schoolId = req.nextUrl.searchParams.get("schoolId");

  const filter: any = {};
  if (level) filter.level = level;

  if (schoolId) {
    try {
      filter.school = new mongoose.Types.ObjectId(schoolId);
    } catch (error) {
      return NextResponse.json({ error: "Invalid schoolId format" }, { status: 400 });
    }
  }

  const classes = await Class.find(filter).populate("teachers", "name email");

  return NextResponse.json({ classes });
}