// app/api/student/dashboard/route.ts
import { connectDB } from "@/utils/db";
import Task from "@/models/Task";
import Submission from "@/models/Submission";
import Student from "@/models/Student";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const studentId = decoded.id;

    const student = await Student.findById(studentId).populate("school");
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const tasks = await Task.find({ level: student.level });
    const submissions = await Submission.find({ student: student._id });

    const completedTaskIds = submissions.map((s: any) => s.task.toString());
    const completedCount = completedTaskIds.length;
    const totalTasks = tasks.length;

    const pendingTasks = tasks.filter((task: any) => !completedTaskIds.includes(task._id.toString()));
    const completedTasks = tasks.filter((task: any) => completedTaskIds.includes(task._id.toString()));

    const scores = submissions.map((s: any) => s.score || 0);
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;

    return NextResponse.json({
      student: {
        name: student.name,
        school: student.school.name,
      },
      weeklyReport: {
        totalTasks,
        completed: completedCount,
        pending: totalTasks - completedCount,
        maxScore,
        minScore,
      },
      tasks: {
        pending: pendingTasks.map((task: any) => ({
          _id: task._id,
          title: task.title,
          questionCount: task.questions.length,
          type: task.type,
          message: task.additionalMessage,
          status: "pending",
        })),
        completed: completedTasks.map((task: any) => ({
          _id: task._id,
          title: task.title,
          questionCount: task.questions.length,
          type: task.type,
          message: task.additionalMessage,
          status: "completed",
        })),
      },
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}