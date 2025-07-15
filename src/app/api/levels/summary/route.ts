// File: /app/api/levels/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Student from "@/models/Student";
import Class from "@/models/Class";
import SchoolLevel from "@/models/SchoolLevel";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const schoolId = req.nextUrl.searchParams.get("schoolId");
    const teacherId = req.nextUrl.searchParams.get("teacherId");

    if (!schoolId) {
      return NextResponse.json({ error: "Missing schoolId" }, { status: 400 });
    }

    const levels = await SchoolLevel.find({ schoolId }).lean();

    const result = [];

    for (const level of levels) {
      const levelCode = level.levelCode;

      // Count students
      const studentCount = await Student.countDocuments({ school: schoolId, level: levelCode });

      // Get classes for level
      const classFilter: any = { school: schoolId, level: levelCode };
      if (teacherId) {
        classFilter.teachers = new mongoose.Types.ObjectId(teacherId);
      }

      const classDocs = await Class.find(classFilter).populate("teachers", "name").lean();
      const classList = await Promise.all(
        classDocs.map(async (cls) => {
          const students = await Student.find({ class: cls._id }, "name score avatar").lean();
          return {
            _id: cls._id,
            name: cls.name,
            teachers: cls.teachers,
            students: students || [],
          };
        })
      );

      // Unique teacher count
      const teacherIds = new Set();
      classDocs.forEach((cls) => {
        cls.teachers.forEach((t: any) => teacherIds.add(t._id.toString()));
      });

      result.push({
        _id: level._id,
        levelCode,
        customName: level.customName,
        studentCount,
        teacherCount: teacherIds.size,
        classes: classList,
      });
    }

    return NextResponse.json({ levels: result });
  } catch (err: any) {
    console.error("Level stats error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}