import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from '@/utils/db';
import Task from "@/models/Task";          // assumed existing
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
    const statusParam = (searchParams.get("status") || "pending").toLowerCase(); // pending|completed
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 10)));

    // ---------- 1) Classes taught by this teacher + student counts ----------
    const classes = await ClassModel.aggregate([
      { $match: { teachers: teacherObjId } },                 // your schema has singular 'teachers'
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

    // ---------- 2) Donut: task-level completed vs pending ----------
    // Completed = no pending TaskResult for that task (if zero results -> pending)
    let report: null | { term: number; week: number; totalTasks: number; completed: number; pending: number } = null;

    const baseTaskMatch: any = { teacher: teacherObjId, isActive: { $ne: false } };
    if (term !== undefined) baseTaskMatch.term = term;
    if (week !== undefined) baseTaskMatch.week = week;

    if (term !== undefined && week !== undefined) {
      const donutAgg = await Task.aggregate([
        { $match: baseTaskMatch },

        // Pull class size for total submissions target (used later too)
        { $lookup: { from: "classes", localField: "class", foreignField: "_id", as: "classDoc" } },
        { $unwind: "$classDoc" },
        { $lookup: { from: "students", localField: "classDoc._id", foreignField: "class", as: "classStudents" } },
        { $addFields: { classSize: { $size: "$classStudents" } } },

        // TaskResult status counts per task
        {
          $lookup: {
            from: "taskresults",
            let: { taskId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$task", "$$taskId"] } } },
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
        {
          $addFields: {
            pendingCount: {
              $ifNull: [
                {
                  $let: {
                    vars: {
                      idx: {
                        $indexOfArray: ["$resStats._id", "pending"]
                      }
                    },
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
            totalResults: { $sum: "$resStats.n" }
          }
        },
        // Task is completed only if there is at least one result AND no pending
        {
          $addFields: {
            isCompleted: { $and: [{ $gt: ["$totalResults", 0] }, { $eq: ["$pendingCount", 0] }] }
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

    // ---------- 3) “Your Evaluations” list: filter by status + pagination ----------
    const pipelineBase: any[] = [
      { $match: baseTaskMatch },
      { $lookup: { from: "classes", localField: "class", foreignField: "_id", as: "classDoc" } },
      { $unwind: "$classDoc" },
      { $lookup: { from: "students", localField: "classDoc._id", foreignField: "class", as: "classStudents" } },
      { $addFields: { classSize: { $size: "$classStudents" } } },

      // Pull TaskResults and compute received, pending, avgScore
      {
        $lookup: {
          from: "taskresults",
          let: { taskId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$task", "$$taskId"] } } },
            {
              $group: {
                _id: "$evaluationStatus",
                n: { $sum: 1 },
                sumScore: { $sum: "$score" } // your score is already /100
              }
            }
          ],
          as: "resStats"
        }
      },
      {
        $addFields: {
          // received = all results (pending + completed)
          received: { $sum: "$resStats.n" },
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
          completedCount: {
            $ifNull: [
              {
                $let: {
                  vars: { idx: { $indexOfArray: ["$resStats._id", "completed"] } },
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
          sumScoreAll: {
            $sum: {
              $map: {
                input: "$resStats",
                as: "r",
                in: "$$r.sumScore"
              }
            }
          }
        }
      },
      // task-level completion derived from pendingCount == 0 and received > 0
      { $addFields: { isCompleted: { $and: [{ $gt: ["$received", 0] }, { $eq: ["$pendingCount", 0] }] } } }
    ];

    const completionFilter =
      statusParam === "completed" ? { isCompleted: true } : { isCompleted: false };

    const [items, total] = await Promise.all([
      Task.aggregate([
        ...pipelineBase,
        { $match: completionFilter },
        {
          $project: {
            _id: 0,
            taskId: "$_id",
            topic: 1,
            type: 1,
            totalQuestions: 1,
            className: "$classDoc.name",
            submissions: { received: "$received", total: "$classSize" },
            avgScore: {
              $cond: [
                { $gt: ["$received", 0] },
                { $round: [{ $divide: ["$sumScoreAll", "$received"] }, 0] }, // already /100
                null
              ]
            }
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ]),
      Task.aggregate([
        ...pipelineBase,
        { $match: completionFilter },
        { $count: "n" }
      ]).then(r => (r?.[0]?.n || 0))
    ]);

    return NextResponse.json({
      classes,
      report,
      evaluations: { items, page, limit, total }
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: err?.status || 500 });
  }
}