import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import { connectDB } from '@/utils/db';
import { getTeacherIdFromAuth } from "@/lib/auth";
import ClassModel from "@/models/Class";
import Student from "@/models/Student";
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";

/**
 * GET /api/teacher/reports?term=1&week=1
 * Auth: Authorization: Bearer <JWT>
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const teacherId = getTeacherIdFromAuth(req);

    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term") ? Number(searchParams.get("term")) : undefined;
    const week = searchParams.get("week") ? Number(searchParams.get("week")) : undefined;

    // Validate required parameters
    if (term === undefined || week === undefined) {
      return NextResponse.json({ error: "Term and week are required" }, { status: 400 });
    }

    const teacherObjId = new mongoose.Types.ObjectId(teacherId);

    // Fixed classes aggregation - ensure ObjectId conversion
    const classes = await ClassModel.aggregate([
      {
        $match: {
          teachers: { $in: [teacherObjId] } // Use $in for array matching
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "class",
          as: "students"
        }
      },
      {
        $project: {
          _id: 0,
          id: { $toString: "$_id" }, // Convert ObjectId to string
          name: 1,
          level: 1,
          studentCount: { $size: "$students" }
        }
      },
      { $sort: { name: 1 } }
    ]);

    // Debug log to check classes
    console.log("Classes found:", classes);

    if (classes.length === 0) {
      return NextResponse.json({
        error: "No classes found for teacher",
        teacherId: teacherId
      }, { status: 404 });
    }

    // Convert string IDs back to ObjectId for database queries
    const teacherClassIds = classes.map(cls => new mongoose.Types.ObjectId(cls.id));

    // Get all TaskResults for this term, week, and ALL teacher's classes
    const taskResults = await TaskResult.find({
      classId: { $in: teacherClassIds },
      term: term,
      week: week
    }).lean();

    if (taskResults.length === 0) {
      return NextResponse.json({
        termWeek: { term, week },
        classes,
        metrics: {
          avgScore: "0/0",
          maxScore: "0/0",
          minScore: "0/0",
          totalSubmissions: "0/0",
          commonMistakes: "0/0"
        },
        tasks: []
      }, { status: 200 });
    }

    // Get unique task IDs and task details
    const uniqueTaskIds = [...new Set(taskResults.map(tr => tr.task.toString()))];
    const tasks = await Task.find({
      _id: { $in: uniqueTaskIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).lean();

    // Get total students across ALL teacher's classes
    const totalStudents = await Student.countDocuments({
      class: { $in: teacherClassIds }
    });

    // Calculate overall metrics across ALL classes for this term and week
    const metricsAgg = await TaskResult.aggregate([
      {
        $match: {
          classId: { $in: teacherClassIds },
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

    // Calculate common mistakes across ALL classes and tasks
    const mistakesAgg = await TaskResult.aggregate([
      {
        $match: {
          classId: { $in: teacherClassIds },
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

    // Build task list with metrics across all classes
    const taskList = await Promise.all(
      tasks.map(async (task: any) => {
        // Get submissions count for this specific task across all classes
        const taskSubmissions = await TaskResult.countDocuments({
          task: task._id,
          classId: { $in: teacherClassIds },
          term: term,
          week: week
        });

        // Get class names where this task was assigned
        const taskClasses = await TaskResult.aggregate([
          {
            $match: {
              task: task._id,
              classId: { $in: teacherClassIds },
              term: term,
              week: week
            }
          },
          {
            $lookup: {
              from: "classes",
              localField: "classId",
              foreignField: "_id",
              as: "classDoc"
            }
          },
          { $unwind: "$classDoc" },
          {
            $group: {
              _id: "$classId",
              className: { $first: "$classDoc.name" }
            }
          }
        ]);

        const classNames = taskClasses.map(tc => tc.className).join(", ");

        return {
          taskId: task._id.toString(),
          topic: task.topic,
          totalQuestions: task.questions?.length || 0,
          submissions: taskSubmissions,
          classNames: classNames || "Unknown"
        };
      })
    );

    // Response
    return NextResponse.json({
      termWeek: { term, week },
      classes, // This should now be properly populated
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
    console.error("API Error:", err);
    const msg = err?.message || "Server error";
    const status = /unauthorized/i.test(msg) ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}