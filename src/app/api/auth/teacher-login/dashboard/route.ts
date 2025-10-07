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
    const teacherId = await getTeacherIdFromAuth(req);
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

    // ---------- 2) Get class IDs for this teacher ----------
    const teacherClassIds = classes.map(cls => cls.id);

    // ---------- 3) Report data (donut chart) ----------
    let report: null | { term: number; week: number; totalTasks: number; completed: number; pending: number } = null;

    if (term !== undefined && week !== undefined && teacherClassIds.length > 0) {
      const tasksWithResults = await TaskResult.aggregate([
        { 
          $match: { 
            classId: { $in: teacherClassIds },
            term: term,
            week: week
          }
        },
        { $group: { _id: "$task" } },
        { $lookup: { from: "tasks", localField: "_id", foreignField: "_id", as: "taskDoc" } },
        { $unwind: "$taskDoc" },
        { $replaceRoot: { newRoot: "$taskDoc" } }
      ]);

      if (tasksWithResults.length > 0) {
        const taskIds = tasksWithResults.map(t => t._id);

        const donutAgg = await Task.aggregate([
          { $match: { _id: { $in: taskIds } } },
          {
            $lookup: {
              from: "taskresults",
              let: { taskId: "$_id" },
              pipeline: [
                { 
                  $match: { 
                    $expr: { $eq: ["$task", "$$taskId"] },
                    classId: { $in: teacherClassIds },
                    term: term,
                    week: week
                  }
                },
                {
                  $group: {
                    _id: "$evaluationStatus",
                    n: { $sum: 1 }
                  }
                }
              ],
              as: "resStats"
            }
          },
          // Get class info to find total students
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
                { $project: { classId: 1 } }
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
              pendingCount: {
                $ifNull: [
                  {
                    $let: {
                      vars: { idx: { $indexOfArray: ["$resStats._id", "pending"] } },
                      in: {
                        $cond: [
                          { $gte: ["$$idx", 0] },
                          { $arrayElemAt: ["$resStats.n", "$$idx"] },
                          0
                        ]
                      }
                    }
                  },
                  0
                ]
              },
              totalResults: { $sum: "$resStats.n" },
              totalStudents: { $ifNull: [{ $arrayElemAt: ["$studentCount.total", 0] }, 0] }
            }
          },
          {
            $addFields: {
              // Task is completed when ALL students submitted AND all are evaluated
              isCompleted: { 
                $and: [
                  { $gt: ["$totalResults", 0] },
                  { $eq: ["$totalResults", "$totalStudents"] }, // All students submitted
                  { $eq: ["$pendingCount", 0] } // All submissions evaluated
                ] 
              }
            }
          },
          {
            $group: {
              _id: "$isCompleted",
              count: { $sum: 1 }
            }
          }
        ]);

        const counts = donutAgg.reduce(
          (acc: any, r: any) => {
            if (r._id) acc.completed = r.count;
            else acc.pending = r.count;
            return acc;
          },
          { completed: 0, pending: 0 }
        );

        report = {
          term,
          week,
          totalTasks: counts.completed + counts.pending,
          completed: counts.completed,
          pending: counts.pending
        };
      }
    }

    // ---------- 4) Base pipeline for task evaluation details ----------
    const getTaskEvaluationsPipeline = () => [
      {
        $match: {
          classId: { $in: teacherClassIds },
          ...(term !== undefined && { term: term }),
          ...(week !== undefined && { week: week })
        }
      },
      { $group: { _id: "$task" } },
      { $lookup: { from: "tasks", localField: "_id", foreignField: "_id", as: "taskDoc" } },
      { $unwind: "$taskDoc" },
      { $replaceRoot: { newRoot: "$taskDoc" } },

      // Get TaskResults for this task
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

      // Get class info
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
            { $lookup: { from: "classes", localField: "classId", foreignField: "_id", as: "classDoc" } },
            { $unwind: "$classDoc" },
            { $project: { className: "$classDoc.name", classId: "$classId" } }
          ],
          as: "classInfo"
        }
      },

      // Get students count for the class
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

      // Calculate stats
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
      },

      // Updated completion logic: task is completed when ALL students submitted AND all evaluated
      { 
        $addFields: { 
          isCompleted: { 
            $and: [
              { $gt: ["$received", 0] },
              { $eq: ["$received", "$totalStudents"] }, // All students must submit
              { $eq: ["$pendingCount", 0] }              // All submissions evaluated
            ] 
          } 
        } 
      }
    ];

    // ---------- 5) Paginated evaluations (current filtered view) ----------
    let items = [];
    let total = 0;

    if (teacherClassIds.length > 0) {
      const completionFilter = statusParam === "completed" ? { isCompleted: true } : { isCompleted: false };

      [items, total] = await Promise.all([
        TaskResult.aggregate([
          ...getTaskEvaluationsPipeline(),
          { $match: completionFilter },
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
              status: {
                $cond: [
                  "$isCompleted",
                  "completed",
                  "pending"
                ]
              }
            }
          },
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit }
        ]),
        TaskResult.aggregate([
          ...getTaskEvaluationsPipeline(),
          { $match: completionFilter },
          { $count: "n" }
        ]).then(r => (r?.[0]?.n || 0))
      ]);
    }

    // ---------- 6) All pending tasks (for pending tab) ----------
    let PendingTasks = [];
    if (teacherClassIds.length > 0) {
      PendingTasks = await TaskResult.aggregate([
        ...getTaskEvaluationsPipeline(),
        { $match: { isCompleted: false } },
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
            status: "pending"
          }
        },
        { $sort: { createdAt: -1 } }
      ]);
    }

    // ---------- 7) All completed tasks (for completed tab) ----------
    let CompletedTasks = [];
    if (teacherClassIds.length > 0) {
      CompletedTasks = await TaskResult.aggregate([
        ...getTaskEvaluationsPipeline(),
        { $match: { isCompleted: true } },
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
            status: "completed"
          }
        },
        { $sort: { createdAt: -1 } }
      ]);
    }

    // ---------- 8) Response structure ----------
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