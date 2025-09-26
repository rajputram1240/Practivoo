import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import { connectDB } from '@/utils/db';
import { getTeacherIdFromAuth } from "@/lib/auth";
import ClassModel from "@/models/Class";
import Student from "@/models/Student";
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";

/**
 * GET /api/teacher/reports?term=1&week=1&classId=<id>
 * Auth: Authorization: Bearer <JWT>
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const teacherId = getTeacherIdFromAuth(req);

    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term") ? Number(searchParams.get("term")) : undefined;
    const week = searchParams.get("week") ? Number(searchParams.get("week")) : undefined;
    const classId = searchParams.get("classId") || "";

    // Validate required parameters
    if (term === undefined || week === undefined) {
      return NextResponse.json({ error: "Term and week are required" }, { status: 400 });
    }

    if (classId && !mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json({ error: "Invalid classId" }, { status: 400 });
    }

    const teacherObjId = new mongoose.Types.ObjectId(teacherId);

    // 1) Get all classes taught by this teacher (for tabs)
    const allClasses = await ClassModel.find({ teachers: teacherObjId }, { name: 1, level: 1 })
      .sort({ name: 1 })
      .lean<{ _id: Types.ObjectId; name: string; level: string }[]>();

    if (allClasses.length === 0) {
      return NextResponse.json({ error: "No classes found for teacher" }, { status: 404 });
    }

    // 2) Determine target class (default to first class if not specified)
    const targetClassId = classId 
      ? new mongoose.Types.ObjectId(classId)
      : allClasses[0]._id;

    const targetClass = allClasses.find(cls => cls._id.equals(targetClassId));
    if (!targetClass) {
      return NextResponse.json({ error: "Class not found for teacher" }, { status: 404 });
    }

    // 3) Get all TaskResults for this term, week, and class
    const taskResults = await TaskResult.find({
      classId: targetClassId,
      term: term,
      week: week
    }).lean();

    if (taskResults.length === 0) {
      return NextResponse.json({
        termWeek: { term, week },
        class: { 
          id: targetClassId.toString(), 
          name: targetClass.name, 
          level: targetClass.level 
        },
        metrics: {
          avgScore: "0/0",
          maxScore: "0/0", 
          minScore: "0/0",
          totalSubmissions: "0/0",
          commonMistakes: "0/0"
        },
        tasks: [],
        tabs: allClasses.map(cls => ({ 
          id: cls._id.toString(), 
          name: cls.name,
          active: cls._id.equals(targetClassId)
        }))
      }, { status: 200 });
    }

    // 4) Get unique task IDs and task details
    const uniqueTaskIds = [...new Set(taskResults.map(tr => tr.task.toString()))];
    const tasks = await Task.find({ 
      _id: { $in: uniqueTaskIds.map(id => new mongoose.Types.ObjectId(id)) } 
    }).lean<{
      _id: Types.ObjectId;
      topic: string;
      level: string;
      category: string;
      questions?: Types.ObjectId[];
      createdAt: Date;
    }[]>();

    // 5) Get total students in class
    const totalStudents = await Student.countDocuments({ class: targetClassId });

    // 6) Calculate overall metrics for term and week
    const metricsAgg = await TaskResult.aggregate([
      { 
        $match: { 
          classId: targetClassId, 
          term: term, 
          week: week 
        } 
      },
      {
        $lookup: {
          from: "tasks",
          localField: "task",
          foreignField: "_id",
          as: "taskDoc"
        }
      },
      { $unwind: "$taskDoc" },
      {
        $addFields: {
          totalQuestions: { $size: { $ifNull: ["$taskDoc.questions", []] } },
          rawScore: {
            $ifNull: [
              "$score",
              { $size: { $filter: { input: "$answers", as: "a", cond: { $eq: ["$$a.isCorrect", true] } } } }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$rawScore" },
          maxScore: { $max: "$rawScore" },
          minScore: { $min: "$rawScore" },
          totalSubmissions: { $sum: 1 },
          avgTotalQuestions: { $avg: "$totalQuestions" },
          maxTotalQuestions: { $max: "$totalQuestions" }
        }
      }
    ]);

    const metrics = metricsAgg[0] || { 
      avgScore: 0, maxScore: 0, minScore: 0, 
      totalSubmissions: 0, avgTotalQuestions: 0, maxTotalQuestions: 0 
    };

    // 7) Calculate common mistakes across all tasks
    const mistakesAgg = await TaskResult.aggregate([
      { 
        $match: { 
          classId: targetClassId, 
          term: term, 
          week: week 
        } 
      },
      { $unwind: "$answers" },
      {
        $group: {
          _id: "$answers.question",
          total: { $sum: 1 },
          correct: { $sum: { $cond: [{ $eq: ["$answers.isCorrect", true] }, 1, 0] } }
        }
      },
      {
        $project: {
          accuracy: {
            $cond: [{ $gt: ["$total", 0] }, { $divide: ["$correct", "$total"] }, 0]
          }
        }
      },
      { $match: { accuracy: { $lt: 0.6 } } },
      { $count: "mistakes" }
    ]);

    const commonMistakes = mistakesAgg?.[0]?.mistakes || 0;
    const totalQuestions = Math.round(metrics.avgTotalQuestions) || 0;

    // 8) Build task list with individual metrics
    const taskList = await Promise.all(
      tasks.map(async (task) => {
        const taskQuestions = task.questions?.length || 0;
        return {
          taskId: task._id.toString(),
          topic: task.topic,
          totalQuestions: taskQuestions,
          submissions: totalStudents,
        };
      })
    );

    // 9) Response
    return NextResponse.json({
      termWeek: { term, week },
      class: { 
        id: targetClassId.toString(), 
        name: targetClass.name, 
        level: targetClass.level 
      },
      metrics: {
        avgScore: totalQuestions ? `${Math.round(metrics.avgScore)}/${totalQuestions}` : "0/0",
        maxScore: totalQuestions ? `${Math.round(metrics.maxScore)}/${totalQuestions}` : "0/0",
        minScore: totalQuestions ? `${Math.round(metrics.minScore)}/${totalQuestions}` : "0/0",
        totalSubmissions: `${metrics.totalSubmissions}/${totalStudents}`,
        commonMistakes: `${commonMistakes}/${totalQuestions || 1}`
      },
      tasks: taskList
    });

  } catch (err: any) {
    console.error(err);
    const msg = err?.message || "Server error";
    const status = /unauthorized/i.test(msg) ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}