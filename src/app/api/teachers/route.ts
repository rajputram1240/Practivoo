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

  /* const hashedPassword = await bcrypt.hash(password, 10); */
  //auto genrated using pre save hook
  const teacherId = await generateUniqueStudentId();

  const teacher = await Teacher.create({
    name,
    gender,
    yoe,
    phone,
    email,
    password,
    school: schoolId,
    teacherId
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

async function generateUniqueStudentId() {
  let id = "1234";
  let exists = true;

  while (exists) {
    id = Math.floor(1000 + Math.random() * 9000).toString();
    const existing = await Teacher.exists({ teacherId: id });
    exists = !!existing; // Convert result to true/false
  }

  return id;
}