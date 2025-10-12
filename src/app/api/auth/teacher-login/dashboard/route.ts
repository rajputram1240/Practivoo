import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from '@/utils/db';
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";
import ClassModel from "@/models/Class";
import Student from "@/models/Student";
import { getTeacherIdFromAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const teacherId = getTeacherIdFromAuth(req);
    const teacherObjId = new mongoose.Types.ObjectId(teacherId);

    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term") ? Number(searchParams.get("term")) : undefined;
    const week = searchParams.get("week") ? Number(searchParams.get("week")) : undefined;
    const statusParam = (searchParams.get("status") || "pending").toLowerCase();
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 10)));

    // ---------- 1) Classes taught by this teacher + student counts ----------
    const classes = await ClassModel.aggregate([
      { $match: { teachers: teacherObjId } },
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
          id: "$_id",
          name: 1,
          level: 1,
          studentCount: { $size: "$students" }
        }
      },
      { $sort: { name: 1 } }
    ]);

    const teacherClassIds = classes.map(cls => cls.id);

    // ---------- 2) Report - Count SUBMISSIONS by evaluationStatus ----------
    let report: null | { term: number; week: number; totalTasks: number; completed: number; pending: number } = null;

    if (term !== undefined && week !== undefined && teacherClassIds.length > 0) {
      const reportData = await TaskResult.aggregate([
        {
          $match: {
            classId: { $in: teacherClassIds },
            term: term,
            week: week
          }
        },
        {
          $group: {
            _id: "$evaluationStatus",  // Group by submission status
            count: { $sum: 1 }
          }
        }
      ]);

      const submissionCounts = reportData.reduce(
        (acc: any, r: any) => {
          if (r._id === "completed") acc.completed = r.count;
          else if (r._id === "pending") acc.pending = r.count;
          return acc;
        },
        { completed: 0, pending: 0 }
      );

      report = {
        term,
        week,
        totalTasks: submissionCounts.completed + submissionCounts.pending,
        completed: submissionCounts.completed,
        pending: submissionCounts.pending
      };
    }

    // ---------- 3) Base pipeline for task evaluation ----------
    const getTaskEvaluationsPipeline = () => [
      {
        $match: {
          classId: { $in: teacherClassIds },
          ...(term !== undefined && { term: term }),
          ...(week !== undefined && { week: week })
        }
      },
      {
        $group: {
          _id: "$task"
        }
      },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "_id",
          as: "taskDoc"
        }
      },
      { $unwind: "$taskDoc" },
      { $replaceRoot: { newRoot: "$taskDoc" } },
      {
        $lookup: {
          from: "taskresults",
          let: { taskId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$task", "$$taskId"] },
                classId: { $in: teacherClassIds },
                ...(term !== undefined && { term: term }),
                ...(week !== undefined && { week: week })
              }
            }
          ],
          as: "taskResults"
        }
      },
      {
        $lookup: {
          from: "taskresults",
          let: { taskId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$task", "$$taskId"] },
                classId: { $in: teacherClassIds }
              }
            },
            { $limit: 1 },
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
              $project: {
                className: "$classDoc.name",
                classId: "$classId"
              }
            }
          ],
          as: "classInfo"
        }
      },
      {
        $lookup: {
          from: "students",
          let: { classId: { $arrayElemAt: ["$classInfo.classId", 0] } },
          pipeline: [
            { $match: { $expr: { $eq: ["$class", "$$classId"] } } },
            { $count: "total" }
          ],
          as: "studentCount"
        }
      },
      {
        $addFields: {
          received: { $size: "$taskResults" },
          pendingCount: {
            $size: {
              $filter: {
                input: "$taskResults",
                cond: { $eq: ["$$this.evaluationStatus", "pending"] }
              }
            }
          },
          completedCount: {
            $size: {
              $filter: {
                input: "$taskResults",
                cond: { $eq: ["$$this.evaluationStatus", "completed"] }
              }
            }
          },
          avgScore: {
            $cond: [
              { $gt: [{ $size: "$taskResults" }, 0] },
              { $round: [{ $avg: "$taskResults.score" }, 0] },
              0
            ]
          },
          className: { $arrayElemAt: ["$classInfo.className", 0] },
          totalStudents: { $ifNull: [{ $arrayElemAt: ["$studentCount.total", 0] }, 0] }
        }
      }
    ];

    // ---------- 4) Paginated evaluations ----------
    let items = [];
    let total = 0;

    if (teacherClassIds.length > 0) {
      const matchCondition = statusParam === "completed" 
        ? { completedCount: { $gt: 0 } }
        : { pendingCount: { $gt: 0 } };

      [items, total] = await Promise.all([
        TaskResult.aggregate([
          ...getTaskEvaluationsPipeline(),
          { $match: matchCondition },
          {
            $project: {
              _id: 0,
              taskId: "$_id",
              topic: 1,
              category: 1,
              totalQuestions: { $size: "$questions" },
              className: 1,
              submissions: {
                received: "$received",
                total: "$totalStudents"
              },
              avgScore: 1,
              pendingCount: 1,
              completedCount: 1,
              status: statusParam
            }
          },
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit }
        ]),
        TaskResult.aggregate([
          ...getTaskEvaluationsPipeline(),
          { $match: matchCondition },
          { $count: "n" }
        ]).then(r => (r?.[0]?.n || 0))
      ]);
    }

    // ---------- 5) All pending tasks ----------
    let PendingTasks = [];
    if (teacherClassIds.length > 0) {
      PendingTasks = await TaskResult.aggregate([
        ...getTaskEvaluationsPipeline(),
        { $match: { pendingCount: { $gt: 0 } } },
        {
          $project: {
            _id: 0,
            taskId: "$_id",
            topic: 1,
            category: 1,
            totalQuestions: { $size: "$questions" },
            className: 1,
            submissions: {
              received: "$received",
              total: "$totalStudents"
            },
            avgScore: 1,
            pendingCount: 1,
            completedCount: 1,
            status: "pending"
          }
        },
        { $sort: { createdAt: -1 } }
      ]);
    }

    // ---------- 6) All completed tasks ----------
    let CompletedTasks = [];
    if (teacherClassIds.length > 0) {
      CompletedTasks = await TaskResult.aggregate([
        ...getTaskEvaluationsPipeline(),
        { $match: { completedCount: { $gt: 0 } } },
        {
          $project: {
            _id: 0,
            taskId: "$_id",
            topic: 1,
            category: 1,
            totalQuestions: { $size: "$questions" },
            className: 1,
            submissions: {
              received: "$received",
              total: "$totalStudents"
            },
            avgScore: 1,
            pendingCount: 1,
            completedCount: 1,
            status: "completed"
          }
        },
        { $sort: { createdAt: -1 } }
      ]);
    }

    return NextResponse.json({
      classes,
      report,
      evaluations: {
        items,
        page,
        limit,
        total
      },
      PendingTasks,
      CompletedTasks,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: err?.status || 500 });
  }
}
