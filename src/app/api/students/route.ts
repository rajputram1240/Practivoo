import { connectDB } from "@/utils/db";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const { name, classId, level, gender, phone, email, password, schoolId } = body;

  if (!name || !classId || !level || !gender || !email || !password || !schoolId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await Student.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const studentId = await generateUniqueStudentId();

  try {
    const student = await Student.create({
      name,
      class: new mongoose.Types.ObjectId(classId),
      level,
      gender,
      phone,
      email,
      password: hashedPassword,
      studentId,
      school: new mongoose.Types.ObjectId(schoolId),
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await connectDB();

  const schoolId = req.nextUrl.searchParams.get("schoolId");

  if (!schoolId) {
    return NextResponse.json({ error: "Missing schoolId" }, { status: 400 });
  }

  let objectId: mongoose.Types.ObjectId;
  try {
    objectId = new mongoose.Types.ObjectId(schoolId);
  } catch (error) {
    return NextResponse.json({ error: "Invalid ObjectId format" }, { status: 400 });
  }

  try {
    // Fetch students
    const students = await Student.find({ school: objectId })
      .populate("class", "name")
      .select("name email gender level studentId score class")
      .lean();

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function generateUniqueStudentId() {
  let id = "1234";
  let exists = true;

  while (exists) {
    id = Math.floor(1000 + Math.random() * 9000).toString();
    const existing = await Student.exists({ studentId: id });
    exists = !!existing; // Convert result to true/false
  }

  return id;
}