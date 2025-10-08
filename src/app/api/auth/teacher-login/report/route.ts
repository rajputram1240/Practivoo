import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/utils/db";
import { getTeacherIdFromAuth } from "@/lib/auth";
import ClassModel from "@/models/Class";
import Student from "@/models/Student";
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";

/**
 * GET /api/teacher/reports?term=1&week=1
 * Auth: Authorization: Bearer <JWT>
 * 
 * Returns comprehensive report data including:
 * - Class leaderboards
 * - Overall metrics (avg/max/min scores, submissions, common mistakes)
 * - List of tasks with submission counts
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const teacherId = await getTeacherIdFromAuth(req);

    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term") ? Number(searchParams.get("term")) : undefined;
    const week = searchParams.get("week") ? Number(searchParams.get("week")) : undefined;

    // Validate required parameters
    if (term === undefined || week === undefined) {
      return NextResponse.json(
        { error: "Term and week are required" }, 
        { status: 400 }
      );
    }

    const teacherObjId = new mongoose.Types.ObjectId(teacherId);

    // ---------- 1) Find all classes taught by the teacher ----------
    const classesRaw = await ClassModel.aggregate([
      {
        $match: {
          teachers: { $in: [teacherObjId] }
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
          id: { $toString: "$_id" },
          name: 1,
          level: 1,
          studentCount: { $size: "$students" }
        }
      },
      { $sort: { name: 1 } }
    ]);

    if (classesRaw.length === 0) {
      return NextResponse.json(
        {
          error: "No classes found for teacher",
          teacherId: teacherId
        },
        { status: 404 }
      );
    }

    // Convert string IDs back to ObjectId for further queries
    const teacherClassIds = classesRaw.map(cls => new mongoose.Types.ObjectId(cls.id));

    // ---------- 2) Per-class, per-student leaderboard ----------
    const classwiseStudentAgg = await TaskResult.aggregate([
      {
        $match: {
          classId: { $in: teacherClassIds },
          term,
          week
        }
      },
      {
        $group: {
          _id: { classId: "$classId", studentId: "$student" },
          score: { $sum: "$score" }
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "_id.studentId",
          foreignField: "_id",
          as: "studentDoc"
        }
      },
      { $unwind: "$studentDoc" },
      {
        $project: {
          classId: { $toString: "$_id.classId" },
          studentId: { $toString: "$_id.studentId" },
          studentName: "$studentDoc.name",
          image: "$studentDoc.image",
          gender: "$studentDoc.gender",
          score: 1
        }
      }
    ]);

    // Organize leaderboards per class, with ranking
    const classIdToStudents: Record<
      string,
      Array<{ 
        rank: number; 
        studentId: string; 
        image: string; 
        gender: string; 
        studentName: string; 
        score: number 
      }>
    > = {};

    // Sort students by score descending for each class and assign ranks
    for (const res of classwiseStudentAgg) {
      if (!classIdToStudents[res.classId]) {
        classIdToStudents[res.classId] = [];
      }
      classIdToStudents[res.classId].push({
        rank: 0, // will be set after sorting
        studentId: res.studentId,
        studentName: res.studentName,
        image: res.image,
        gender: res.gender,
        score: res.score
      });
    }

    Object.keys(classIdToStudents).forEach(classId => {
      // Sort descending by score, then by name for stable ordering
      const students = classIdToStudents[classId].sort((a, b) =>
        b.score !== a.score
          ? b.score - a.score
          : a.studentName.localeCompare(b.studentName)
      );
      
      let prevScore: number | null = null;
      let currentRank = 0;
      
      students.forEach((stu, idx) => {
        if (stu.score !== prevScore) {
          currentRank = idx + 1;
          prevScore = stu.score;
        }
        stu.rank = currentRank;
      });
    });

    // ---------- 3) Get all TaskResults for this term, week ----------
    const taskResults = await TaskResult.find({
      classId: { $in: teacherClassIds },
      term: term,
      week: week
    }).lean();

    // If no submissions found, return early with empty metrics
    if (taskResults.length === 0) {
      const resultClasses = classesRaw.map(cls => ({
        id: cls.id,
        name: cls.name,
        level: cls.level,
        studentCount: cls.studentCount,
        leaderboard: []
      }));

      return NextResponse.json({
        termWeek: { term, week },
        classes: resultClasses,
        metrics: {
          avgScore: "0/0",
          maxScore: "0/0",
          minScore: "0/0",
          totalSubmissions: "0/0",
          commonMistakes: "0/0"
        },
        tasks: []
      });
    }

    // ---------- 4) Get unique tasks ----------
    const uniqueTaskIds = [...new Set(taskResults.map(tr => tr.task.toString()))];
    const tasks = await Task.find({
      _id: { $in: uniqueTaskIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).lean();

    // ---------- 5) Calculate overall metrics ----------
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
              { 
                $size: { 
                  $filter: { 
                    input: "$answers", 
                    as: "a", 
                    cond: { $eq: ["$$a.isCorrect", true] } 
                  } 
                } 
              }
            ]
          },
          incorrectAnswers: {
            $size: {
              $filter: {
                input: { $ifNull: ["$answers", []] },
                as: "a",
                cond: { $eq: ["$$a.isCorrect", false] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$rawScore" },
          maxScore: { $max: "$rawScore" },
          minScore: { $min: "$rawScore" },
          totalSubmissionsReceived: { $sum: 1 },
          totalQuestions: { $sum: "$totalQuestions" },
          totalIncorrectAnswers: { $sum: "$incorrectAnswers" }
        }
      }
    ]);

    const metrics = metricsAgg[0] || {
      avgScore: 0,
      maxScore: 0,
      minScore: 0,
      totalSubmissionsReceived: 0,
      totalQuestions: 0,
      totalIncorrectAnswers: 0
    };

    // ---------- 6) Calculate expected submissions ----------
    // For each task, count students in the classes where task was assigned
    const expectedSubmissions = await TaskResult.aggregate([
      {
        $match: {
          classId: { $in: teacherClassIds },
          term: term,
          week: week
        }
      },
      {
        $group: {
          _id: { task: "$task", classId: "$classId" }
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "_id.classId",
          foreignField: "class",
          as: "students"
        }
      },
      {
        $group: {
          _id: "$_id.task",
          expectedCount: { $sum: { $size: "$students" } }
        }
      },
      {
        $group: {
          _id: null,
          totalExpected: { $sum: "$expectedCount" }
        }
      }
    ]);

    const totalExpectedSubmissions = expectedSubmissions[0]?.totalExpected || 0;

    // ---------- 7) Calculate average questions per submission ----------
    const avgQuestionsPerSubmission = metrics.totalSubmissionsReceived > 0
      ? Math.round(metrics.totalQuestions / metrics.totalSubmissionsReceived)
      : 0;

    // ---------- 8) Build task list ----------
    const taskList = await Promise.all(
      tasks.map(async (task: any) => {
        const taskSubmissions = await TaskResult.countDocuments({
          task: task._id,
          classId: { $in: teacherClassIds },
          term: term,
          week: week
        });

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

    // ---------- 9) Final result: classes with per-class student leaderboards ----------
    const resultClasses = classesRaw.map(cls => ({
      id: cls.id,
      name: cls.name,
      level: cls.level,
      studentCount: cls.studentCount,
      leaderboard: classIdToStudents[cls.id] || []
    }));

    // ---------- 10) Response ----------
    return NextResponse.json({
      termWeek: { term, week },
      classes: resultClasses,
      metrics: {
        avgScore: avgQuestionsPerSubmission > 0 
          ? `${Math.round(metrics.avgScore)}/${avgQuestionsPerSubmission}` 
          : "0/0",
        maxScore: avgQuestionsPerSubmission > 0 
          ? `${Math.round(metrics.maxScore)}/${avgQuestionsPerSubmission}` 
          : "0/0",
        minScore: avgQuestionsPerSubmission > 0 
          ? `${Math.round(metrics.minScore)}/${avgQuestionsPerSubmission}` 
          : "0/0",
        totalSubmissions: `${metrics.totalSubmissionsReceived}/${totalExpectedSubmissions}`,
        commonMistakes: `${metrics.totalIncorrectAnswers}/${metrics.totalQuestions}`
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
