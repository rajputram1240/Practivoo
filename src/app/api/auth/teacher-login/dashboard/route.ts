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
    const statusParam = (searchParams.get("status") || "pending").toLowerCase();
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 10)));


    // ---------- 1) Get classes taught by this teacher ----------
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
          school: 1,
          studentCount: { $size: "$students" }
        }
      },
      { $sort: { name: 1 } }
    ]);


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


    // ---------- 2) Report - Count SUBMISSIONS by evaluationStatus ----------
    let report: null | { 
      term: number; 
      week: number; 
      totalTasks: number; 
      completed: number; 
      pending: number 
    } = null;


    if (term !== undefined && week !== undefined) {
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
            _id: "$evaluationStatus",
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


    // ---------- 3) Base pipeline using SchoolTask for term/week ----------
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
      {
        $lookup: {
          from: "taskresults",
          let: { taskId: "$task" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$task", "$$taskId"] },
                    { $in: ["$classId", teacherClassIds] }
                  ]
                }
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
          classId: { $arrayElemAt: ["$classInfo.classId", 0] },  // Added classId here
          totalStudents: { $ifNull: [{ $arrayElemAt: ["$studentCount.total", 0] }, 0] }
        }
      }
    ];


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
            taskId: "$task",
            topic: "$taskDoc.topic",
            category: "$taskDoc.category",
            level: "$taskDoc.level",
            term: 1,
            week: 1,
            totalQuestions: { $size: { $ifNull: ["$taskDoc.questions", []] } },
            className: 1,
            classId: 1,  // Added classId here
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
        { $sort: { term: -1, week: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ]),
      SchoolTask.aggregate([
        ...getTaskEvaluationsPipeline(),
        { $match: matchCondition },
        { $count: "n" }
      ]).then(r => (r?.[0]?.n || 0))
    ]);


    // ---------- 5) All pending tasks ----------
    const PendingTasks = await SchoolTask.aggregate([
      ...getTaskEvaluationsPipeline(),
      { $match: { pendingCount: { $gt: 0 } } },
      {
        $project: {
          _id: 0,
          taskId: "$task",
          topic: "$taskDoc.topic",
          category: "$taskDoc.category",
          level: "$taskDoc.level",
          term: 1,
          week: 1,
          totalQuestions: { $size: { $ifNull: ["$taskDoc.questions", []] } },
          className: 1,
          classId: 1,  // Added classId here
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
      { $sort: { term: -1, week: -1 } }
    ]);


    // ---------- 6) All completed tasks ----------
    const CompletedTasks = await SchoolTask.aggregate([
      ...getTaskEvaluationsPipeline(),
      { $match: { completedCount: { $gt: 0 } } },
      {
        $project: {
          _id: 0,
          taskId: "$task",
          topic: "$taskDoc.topic",
          category: "$taskDoc.category",
          level: "$taskDoc.level",
          term: 1,
          week: 1,
          totalQuestions: { $size: { $ifNull: ["$taskDoc.questions", []] } },
          className: 1,
          classId: 1,  // Added classId here
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
      { $sort: { term: -1, week: -1 } }
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
      PendingTasks,
      CompletedTasks,
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