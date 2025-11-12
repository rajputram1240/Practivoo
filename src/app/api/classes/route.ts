import { connectDB } from "@/utils/db";
import Class from "@/models/Class";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

/* single teacehr */
/* export async function POST(req: NextRequest) {
  await connectDB();
  const { name, levelCode, teacher, schoolId } = await req.json();

  if (!name || !levelCode || !schoolId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const newClass = await Class.create({
    name,
    level: levelCode,
    teachers: teacher || [],
    school: schoolId,
  });

  return NextResponse.json(newClass, { status: 201 });
} */

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
  return NextResponse.json({ classes }, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  await connectDB();
  const { classId, teachers } = await req.json();

  if (!classId) {
    return NextResponse.json({ error: "Class ID required" }, { status: 400 });
  }

  if (!teachers || teachers.length === 0) {
    return NextResponse.json({ error: "At least one teacher required" }, { status: 400 });
  }

  // Get the class before update to check for existing teachers
  const existingClass = await Class.findById(classId);

  if (!existingClass) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  // Check which teachers already exist
  const existingTeacherIds = existingClass.teachers.map((t: any) => t.toString());
  const newTeachers = teachers.filter((teacherId: string) => !existingTeacherIds.includes(teacherId));
  const duplicateTeachers = teachers.filter((teacherId: string) => existingTeacherIds.includes(teacherId));

  // If all teachers already exist
  if (newTeachers.length === 0) {
    return NextResponse.json({
      message: "All selected teachers already exist in the class",
      duplicates: duplicateTeachers.length
    }, { status: 200 });
  }

  // Add only new teachers to the class
  const updatedClass = await Class.findByIdAndUpdate(
    classId,
    {
      $addToSet: {
        teachers: { $each: newTeachers }
      }
    },
    { new: true }
  )

  // Prepare response message based on duplicates
  let message = "";
  if (duplicateTeachers.length > 0) {
    message = `${newTeachers.length} teacher(s) added successfully. ${duplicateTeachers.length} teacher(s) already existed in the class.`;
  } else {
    message = `${newTeachers.length} teacher(s) added successfully`;
  }

  return NextResponse.json({
    message,
    class: updatedClass,
    added: newTeachers.length,
    duplicates: duplicateTeachers.length
  }, { status: 200 });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const { name, levelCode, teachers, schoolId } = await req.json();

  if (!name || !levelCode || !schoolId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }


  const newClass = await Class.create({
    name,
    level: levelCode,
    teachers,
    school: schoolId,
  });

  return NextResponse.json(newClass, { status: 201 });
}