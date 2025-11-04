import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from '@/utils/db';
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";
import ClassModel from "@/models/Class";
import SchoolTask from "@/models/schooltask";
import { getTeacherIdFromAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const teacherId = getTeacherIdFromAuth(req);
    const teacherObjId = new mongoose.Types.ObjectId(teacherId);

    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term") ? Number(searchParams.get("term")) : undefined;
    const week = searchParams.get("week") ? Number(searchParams.get("week")) : undefined;
    const level = searchParams.get("level")?.trim() || undefined;
    const statusParam = (searchParams.get("status") || "pending").toLowerCase();
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 10)));
    console.log(level, term, week)
    // ---------- 1) Get classes taught by this teacher ----------
    const classMatchCondition: any = { teachers: teacherObjId };
    if (level) {
      classMatchCondition.level = level;
    }

    const classes = await ClassModel.aggregate([
      { $match: classMatchCondition },
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
          school: 1,
          studentCount: { $size: "$students" }
        }
      },
      { $sort: { name: 1 } }
    ]);
    console.log(classes, level, term, week)

    if (classes.length === 0) {
      return NextResponse.json({
        classes: [],
        report: null,
        evaluations: { items: [], page, limit, total: 0 },
        PendingTasks: [],
        CompletedTasks: []
      });
    }

    const teacherClassIds = classes.map(cls => cls.id);
    const schoolId = classes[0].school;

    // ---------- 2) UPDATED REPORT - Count unique tasks, not individual submissions ----------
    const reportData = await TaskResult.aggregate([
      {
        $match: {
          classId: { $in: teacherClassIds },
          ...(term !== undefined && { term: term }),
          ...(week !== undefined && { week: week })
        }
      },
      {
        $group: {
          _id: {
            task: "$task",
            term: "$term",
            week: "$week",
            classId: "$classId"
          },
          evaluationStatuses: { $push: "$evaluationStatus" }
        }
      },
      {
        $addFields: {
          taskStatus: {
            $cond: [
              { $in: ["pending", "$evaluationStatuses"] },
              "pending",
              "completed"
            ]
          }
        }
      },
      {
        $group: {
          _id: "$taskStatus",
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

    let report: {
      totalTasks: number,
      completed: number,
      pending: number,
      term?: number,
      week?: number
    } = {
      totalTasks: submissionCounts.completed + submissionCounts.pending,
      completed: submissionCounts.completed,
      pending: submissionCounts.pending,
    };

    if (term && week) {
      report.term = term;
      report.week = week;
    }

    // ---------- 3) Group by classId to get accurate per-class data ----------
    const getTaskEvaluationsPipeline = () => [
      {
        $match: {
          school: schoolId,
          ...(term !== undefined && { term: term }),
          ...(week !== undefined && { week: week })
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
        $match: {
          "taskDoc.status": "Assigned"
        }
      },
      {
        $lookup: {
          from: "taskresults",
          let: { taskId: "$task", termNum: "$term", weekNum: "$week" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$task", "$$taskId"] },
                    { $eq: ["$term", "$$termNum"] },
                    { $eq: ["$week", "$$weekNum"] },
                    { $in: ["$classId", teacherClassIds] }
                  ]
                }
              }
            }
          ],
          as: "taskResults"
        }
      },
      { $unwind: { path: "$taskResults", preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: {
            task: "$task",
            term: "$term",
            week: "$week",
            classId: "$taskResults.classId"
          },
          taskDoc: { $first: "$taskDoc" },
          term: { $first: "$term" },
          week: { $first: "$week" },
          allResults: { $push: "$taskResults" }
        }
      },
      {
        $lookup: {
          from: "classes",
          localField: "_id.classId",
          foreignField: "_id",
          as: "classDoc"
        }
      },
      { $unwind: "$classDoc" },
      ...(level ? [{ $match: { "classDoc.level": level } }] : []),
      {
        $lookup: {
          from: "students",
          let: { classId: "$_id.classId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$class", "$$classId"] } } },
            { $count: "total" }
          ],
          as: "studentCount"
        }
      },
      {
        $addFields: {
          received: { $size: "$allResults" },
          pendingCount: {
            $size: {
              $filter: {
                input: "$allResults",
                cond: { $eq: ["$$this.evaluationStatus", "pending"] }
              }
            }
          },
          completedCount: {
            $size: {
              $filter: {
                input: "$allResults",
                cond: { $eq: ["$$this.evaluationStatus", "completed"] }
              }
            }
          },
          avgScore: {
            $cond: [
              { $gt: [{ $size: "$allResults" }, 0] },
              { $round: [{ $avg: "$allResults.score" }, 0] },
              0
            ]
          },
          className: "$classDoc.name",
          classLevel: "$classDoc.level",
          classId: "$_id.classId",
          totalStudents: { $ifNull: [{ $arrayElemAt: ["$studentCount.total", 0] }, 0] }
        }
      }
    ];


    /* 
    t 69061bfdcaba16e5582e5611
    s 69061bc0caba16e5582e55e0
    class 69061b9fcaba16e5582e55cc*/
    // ---------- 4) Paginated evaluations ----------
    let items = [];
    let total = 0;

    const matchCondition = statusParam === "completed"
      ? { completedCount: { $gt: 0 } }
      : { pendingCount: { $gt: 0 } };

    [items, total] = await Promise.all([
      SchoolTask.aggregate([
        ...getTaskEvaluationsPipeline(),
        { $match: matchCondition },
        {
          $project: {
            _id: 0,
            taskId: "$_id.task",
            topic: "$taskDoc.topic",
            category: "$taskDoc.category",
            level: "$classLevel",
            term: 1,
            week: 1,
            totalQuestions: { $size: { $ifNull: ["$taskDoc.questions", []] } },
            className: 1,
            classId: 1,
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
        { $sort: { term: -1, week: -1, className: 1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ]),
      SchoolTask.aggregate([
        ...getTaskEvaluationsPipeline(),
        { $match: matchCondition },
        { $count: "n" }
      ]).then(r => (r?.[0]?.n || 0))
    ]);

    return NextResponse.json({
      classes,
      report,
      evaluations: {
        items,
        page,
        limit,
        total
      },

    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({
      error: err?.message || "Server error"
    }, {
      status: err?.status || 500
    });
  }
}
