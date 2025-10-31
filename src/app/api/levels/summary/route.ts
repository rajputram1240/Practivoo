// File: /app/api/levels/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Student from "@/models/Student";
import Class from "@/models/Class";
import TaskResult from "@/models/TaskResult";
import mongoose from "mongoose";
import Level from "@/models/Level";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const schoolId = req.nextUrl.searchParams.get("schoolId");
    const teacherId = req.nextUrl.searchParams.get("teacherId");

    if (!schoolId) {
      return NextResponse.json({ error: "Missing schoolId" }, { status: 400 });
    }

    const levels = await Level.find().sort({ order: 1 }).lean();
    const result = [];
    for (const level of levels) {
      const levelCode = level.code;

      // Build class filter
      const classFilter: any = { school: schoolId, level: levelCode };
      if (teacherId) {
        classFilter.teachers = new mongoose.Types.ObjectId(teacherId);
      }

      // Get all classes for this level
      const classDocs = await Class.find(classFilter)
        .populate("teachers", "name")
        .lean();

      // Get all class IDs for this level
      const classIds = classDocs.map((cls) => cls._id);

      // Count unique students for this level (only students in these classes)
      const studentCount = await Student.countDocuments({
        school: schoolId,
        level: levelCode,
        class: { $in: classIds },
      });

      // Build class list with students and their scores from TaskResult
      const classList = await Promise.all(
        classDocs.map(async (cls) => {
          // Get students for this class
          const students = await Student.find(
            { class: cls._id },
            "name avatar"
          ).lean();

          // Aggregate total scores from TaskResult for students in this class
          const studentScores = await TaskResult.aggregate([
            {
              $match: {
                classId: cls._id,
                student: { $in: students.map(s => s._id) }
              }
            },
            {
              $group: {
                _id: "$student",
                totalScore: { $sum: "$score" }
              }
            }
          ]);

          // Create a score lookup map
          const scoreMap = new Map(
            studentScores.map(item => [item._id.toString(), item.totalScore])
          );

          // Attach total score to each student
          const studentsWithScores = students.map(student => ({
            _id: student._id,
            name: student.name,
            avatar: student.avatar,
            score: scoreMap.get(student?._id?.toString()) || 0
          }));
          return {
            _id: cls._id,
            name: cls.name,
            teachers: cls.teachers,
            students: studentsWithScores || [],
          };
        })
      );

      // Count unique teachers using Set
      const teacherIds = new Set();
      classDocs.forEach((cls) => {
        if (Array.isArray(cls.teachers)) {
          cls.teachers.forEach((t: any) => {
            if (t && t._id) {
              teacherIds.add(t._id.toString());
            }
          });
        }
      });

      result.push({
        _id: level._id,
        levelname: levelCode,
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
