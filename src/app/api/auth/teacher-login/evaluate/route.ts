import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import { connectDB } from '@/utils/db';
import { getTeacherIdFromAuth } from "@/lib/auth";
import ClassModel from "@/models/Class";
import Student from "@/models/Student";
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";

function badId(id?: string) {
  return !id || !mongoose.Types.ObjectId.isValid(id);
}

/**
 * GET /api/teacher/evaluate?taskId=<id>&classId=<id>
 * Auth: Authorization: Bearer <JWT>
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const teacherId = getTeacherIdFromAuth(req);

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId") || "";
    const classId = searchParams.get("classId") || "";

    if (badId(taskId) || badId(classId)) {
      return NextResponse.json({ error: "Valid taskId and classId are required" }, { status: 400 });
    }

    const taskObjId = new mongoose.Types.ObjectId(taskId);
    const classObjId = new mongoose.Types.ObjectId(classId);

    // 0) Authorize: class must belong to this teacher
    const cls = await ClassModel.findOne({ _id: classObjId, teachers: teacherId })
      .select({ name: 1, level: 1 })
      .lean<{ _id: Types.ObjectId; name: string; level: string }>();
    if (!cls) return NextResponse.json({ error: "Class not found for teacher" }, { status: 404 });

    // 1) Load Task (your Task has no teacher/class fields)
    const task = await Task.findById(taskObjId)
      .select({ topic: 1, level: 1, category: 1, status: 1, term: 1, week: 1, questions: 1, createdAt: 1 })
      .lean<{
    _id: Types.ObjectId;
    topic: string;
    level: string;
    category: string;
    status: "Assigned" | "Drafts";
    term?: number;
    week?: number;
    questions?: Types.ObjectId[];
  }>();
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const totalQuestions = task?.questions?.length ?? 0;

    // 2) Header metrics from TaskResult for this task+class
    const headerAgg = await TaskResult.aggregate([
      { $match: { task: taskObjId, classId: classObjId } },
      {
        $addFields: {
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
          totalSubmissions: { $sum: 1 }
        }
      }
    ]);
    const h = headerAgg[0] || { avgScore: null, maxScore: null, minScore: null, totalSubmissions: 0 };

    // 3) Common mistakes: questions with <60% accuracy among submitted results
    const mistakesAgg = await TaskResult.aggregate([
      { $match: { task: taskObjId, classId: classObjId } },
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

    // 4) Class roster + per-student submission
    const students = await Student.aggregate([
      { $match: { class: classObjId } },
      {
        $lookup: {
          from: "taskresults",
          let: { sid: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $and: [{ $eq: ["$student", "$$sid"] }, { $eq: ["$task", taskObjId] }] }
              }
            },
            {
              $addFields: {
                rawScore: {
                  $ifNull: [
                    "$score",
                    { $size: { $filter: { input: "$answers", as: "a", cond: { $eq: ["$$a.isCorrect", true] } } } }
                  ]
                }
              }
            },
            { $project: { _id: 1, rawScore: 1, evaluationStatus: 1, createdAt: 1 } }
          ],
          as: "res"
        }
      },
      { $addFields: { res: { $arrayElemAt: ["$res", 0] } } },
      {
        $project: {
          _id: 0,
          studentId: "$_id",
          name: 1,
          image: { $ifNull: ["$image", "/user.png"] },
          hasSubmission: { $toBool: "$res._id" },
          evaluationStatus: { $ifNull: ["$res.evaluationStatus", "pending"] },
          score: "$res.rawScore"
        }
      },
      { $sort: { name: 1 } }
    ]);

    // 5) Tabs (all classes taught by this teacher)
    const tabs = await ClassModel.find({ teachers: teacherId }, { name: 1 }).sort({ name: 1 }).lean<{ _id: Types.ObjectId; name: string }[]>();

    return NextResponse.json({
      task: {
        id: task._id.toString(),
        topic: task.topic,
        level: task.level,
        category: task.category,
        status: task.status,
        term: task.term ?? null,
        week: task.week ?? null,
        totalQuestions
      },
      class: { id: classObjId.toString(), name: cls.name, level: cls.level },
      metrics: {
        avgScore: totalQuestions ? `${h.avgScore !== null ? Math.round(h.avgScore) : 0}/${totalQuestions}` : null,
        maxScore: totalQuestions ? `${h.maxScore !== null ? Math.round(h.maxScore) : 0}/${totalQuestions}` : null,
        minScore: totalQuestions ? `${h.minScore !== null ? Math.round(h.minScore) : 0}/${totalQuestions}` : null,
        totalSubmissions: h.totalSubmissions,
        commonMistakes: totalQuestions ? `${commonMistakes}/${totalQuestions}` : `${commonMistakes}`
      },
      submissions: students.map(s => ({
        studentId: s.studentId.toString(),
        name: s.name,
        image: s.image,
        hasSubmission: s.hasSubmission,
        evaluationStatus: s.evaluationStatus,
        scoreLabel: s.hasSubmission && typeof s.score === "number" && totalQuestions
          ? `${s.score}/${totalQuestions}`
          : null
      })),
      tabs: tabs.map(t => ({ id: t._id.toString(), name: t.name }))
    });
  } catch (err: any) {
    console.error(err);
    const msg = err?.message || "Server error";
    const status = /unauthorized/i.test(msg) ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}