import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/utils/db';
import Student from "@/models/Student";
import ClassModel from "@/models/Class";
import { Types } from "mongoose";
import "@/models/Teacher";
import Task from "@/models/Task";            // expects: { _id, class, level, term?: number|string, week?: number|string, totalMarks?: number }
import TaskResult from "@/models/TaskResult"; // expects: { _id, student, task, score: number, status?: "completed" | ... }

type Id = string;

type StudentClassPick = { _id: Types.ObjectId; class: Types.ObjectId };

async function verifyTeacherOwnsStudentClass(studentId: string, teacherId?: string) {
  if (!teacherId) return true; // loosen until JWT is wired

  const st = await Student.findById(studentId)
    .select("class")
    .lean<StudentClassPick | null>();   // 👈 tell TS the shape

  if (!st) return false;

  // If teachers is an array, this still works (Mongo matches within arrays).
  const owns = await ClassModel.exists({
    _id: st.class,
    teachers: new Types.ObjectId(teacherId),
  });

  return !!owns;
}

export async function GET(req: NextRequest, context: any) {
  try {
    await connectDB();

    const studentId = context?.params?.studentId;
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId") || undefined;
    const term = searchParams.get("term") || undefined;
    const week = searchParams.get("week") || undefined;

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    // Permissions: teacher must be assigned to the student's class
    const allowed = await verifyTeacherOwnsStudentClass(studentId, teacherId);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // --- 1) Student & class basics
    const student = await Student.findById(studentId)
      .select("_id name email phone gender level image class score school")
      .populate({ path: "class", model: ClassModel, select: "_id name level teachers" });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const classId = (student.class as any)?._id?.toString?.() || (student.class as any)?.toString?.();

    // --- 2) Rank in class (by Student.score; change to your metric if needed)
    const classmates = await Student.find({ class: classId })
      .select("_id score")
      .sort({ score: -1, _id: 1 })
      .lean();

    const classSize = classmates.length;
    const rank =
      classmates.findIndex((s) => String(s._id) === String(student._id)) + 1 || classSize;

    // --- 3) Weekly report
    // Filter tasks for this class (optionally by term/week)
    const taskFilter: any = { class: classId };
    if (term) taskFilter.term = term;
    if (week) taskFilter.week = week;

    const tasks = await Task.find(taskFilter).select("_id totalMarks").lean();
    const taskIds = tasks.map((t) => t._id);

    // Results for this student for those tasks
    const results = taskIds.length
      ? await TaskResult.find({ student: student._id, task: { $in: taskIds } })
          .select("_id score status task")
          .lean()
      : [];

    const totalTasks = tasks.length;
    const completed = results.length; // if you track status, you can count by { status: "completed" }
    const pending = Math.max(totalTasks - completed, 0);

    // Score stats (from TaskResult.score)
    const scores = results.map((r: any) => Number(r.score) || 0);
    const maxScore = scores.length ? Math.max(...scores) : 0;
    const minScore = scores.length ? Math.min(...scores) : 0;

    // Points for the header—using Student.score field you already have.
    // If you prefer cumulative points, swap to `results.reduce((a, r) => a + (r.score || 0), 0)`
    const points = Number((student as any).score ?? 0);

    return NextResponse.json(
      {
        student: {
          _id: String(student._id),
          name: student.name,
          gender: student.gender,
          email: student.email,
          phone: student.phone,
          level: student.level,
          image: student.image,
        },
        class: {
          _id: classId,
          name: (student.class as any)?.name,
          level: (student.class as any)?.level,
        },
        header: {
          // e.g., "#4/30"
          rank,
          classSize,
          points, // for "Points 25"
        },
        weeklyReport: {
          scope: {
            term: term ?? null,
            week: week ?? null,
          },
          totalTasks,
          completed,
          pending,
          maxScore,
          minScore,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET /api/teacher/students/[studentId]/profile error:", err);
    return NextResponse.json({ error: "Failed to fetch student profile" }, { status: 500 });
  }
}