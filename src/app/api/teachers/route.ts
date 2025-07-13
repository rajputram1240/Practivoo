import { connectDB } from "@/utils/db";
import Teacher from "@/models/Teacher";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  await connectDB();
  const { name, gender, yoe, phone, email, password, schoolId } = await req.json();

  if (!name || !email || !password || !schoolId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await Teacher.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const teacher = await Teacher.create({
    name,
    gender,
    yoe,
    phone,
    email,
    password: hashedPassword,
    school: schoolId,
  });

  return NextResponse.json(teacher, { status: 201 });
}

export async function GET(req: NextRequest) {
  await connectDB();

  const schoolId = req.nextUrl.searchParams.get("schoolId");

  let filter = {};
  if (schoolId) {
    let objectId: mongoose.Types.ObjectId;
    try {
      objectId = new mongoose.Types.ObjectId(schoolId);
      filter = { school: objectId };
    } catch (error) {
      return NextResponse.json({ error: "Invalid ObjectId format" }, { status: 400 });
    }
  }

  const teachers = await Teacher.find(filter).select("-password");
  return NextResponse.json({ teachers });
}