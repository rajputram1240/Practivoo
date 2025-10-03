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

    // Find all classes taught by the teacher
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
      return NextResponse.json({
        error: "No classes found for teacher",
        teacherId: teacherId
      }, { status: 404 });
    }

    // Convert string IDs back to ObjectId for further queries
    const teacherClassIds = classesRaw.map(cls => new mongoose.Types.ObjectId(cls.id));
    const classIdToInfo = new Map(classesRaw.map(cls => [cls.id, { name: cls.name, level: cls.level }]));

    // Per-class, per-student leaderboard
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
      Array<{ rank: number; studentId: string; image: string, gender: string,studentName: string; score: number }>
    > = {};

    // Sort students by score descending for each class and assign ranks
    for (const res of classwiseStudentAgg) {
      if (!classIdToStudents[res.classId]) classIdToStudents[res.classId] = [];
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
      // Sort descending by points, then by name for stable ordering
      const students = classIdToStudents[classId].sort((a, b) =>
        b.score !== a.score
          ? b.score - a.score
          : a.studentName.localeCompare(b.studentName)
      );
      let rank = 0;
      let prevPoints: number | null = null;
      let currentRank = 0;
      students.forEach((stu, idx) => {
        if (stu.score !== prevPoints) {
          currentRank = idx + 1;
          prevPoints = stu.score;
        }
        rank++;
        stu.rank = currentRank;
      });
    });

    // Get all TaskResults for this term, week, and ALL teacher's classes
    const taskResults = await TaskResult.find({
      classId: { $in: teacherClassIds },
      term: term,
      week: week
    }).lean();

    // If no submissions found, early response for metrics/tasks
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
      }, { status: 200 });
    }

    // Task metrics
    const uniqueTaskIds = [...new Set(taskResults.map(tr => tr.task.toString()))];
    const tasks = await Task.find({
      _id: { $in: uniqueTaskIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).lean();

    // Get total students across ALL teacher's classes
    const totalStudents = await Student.countDocuments({
      class: { $in: teacherClassIds }
    });

    // Calculate overall metrics
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

    // Common mistakes
    const mistakesAgg = await TaskResult.aggregate([
      { $match: { classId: { $in: teacherClassIds }, term, week } },
      { $unwind: "$answers" },
      {
        $group: {
          _id: "$answers.question",
          totalAnswers: { $sum: 1 },
          correctAnswers: {
            $sum: {
              $cond: [{ $eq: ["$answers.isCorrect", true] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          accuracy: {
            $cond: [
              { $gt: ["$totalAnswers", 0] },
              { $divide: ["$correctAnswers", "$totalAnswers"] },
              0
            ]
          }
        }
      },
      { $match: { accuracy: { $lt: 0.6 } } }, //60%-accuracy
      {
        $group: { _id: null, commonMistakes: { $sum: 1 } }
      }
    ]);

    const commonMistakes = mistakesAgg.length > 0 ? mistakesAgg[0].commonMistakes : 0;
    const totalQuestions = Math.round(metrics.avgTotalQuestions) || 0;

    // Build task list
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

    // Final result: classes with per-class student leaderboards
    const resultClasses = classesRaw.map(cls => ({
      id: cls.id,
      name: cls.name,
      level: cls.level,
      studentCount: cls.studentCount,
      leaderboard: classIdToStudents[cls.id] || []
    }));

    // Response
    return NextResponse.json({
      termWeek: { term, week },
      classes: resultClasses,
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
