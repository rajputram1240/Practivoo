import Student from "@/models/Student";
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";
import Teacher from "@/models/Teacher";
import Class from "@/models/Class";
import Question from "@/models/Question";
import SchoolTask from "@/models/schooltask";
import { connectDB } from "@/utils/db";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const selectedTerm = parseInt(searchParams.get('term') || '1');
        const selectedWeek = parseInt(searchParams.get('week') || '1');
        const selectedLevel = searchParams.get('level') || 'Pre-A1';

        const { schoolId } = await params;
        const schoolObjectId = new mongoose.Types.ObjectId(schoolId);

        // Get total counts
        const teacherCount = await Teacher.countDocuments({ school: schoolObjectId });
        const studentCount = await Student.countDocuments({ school: schoolObjectId });

        // Get students filtered by level
        const allStudents = await Student.find({
            school: schoolObjectId,
        }).populate('class', 'name')
            .select('name class image studentId')
            .sort({ name: 1 }).select('_id name image studentId class');

        const studentIds = allStudents.map(s => s._id);

        // Format students for UI
        const formattedStudents = allStudents.map(student => ({
            _id: student._id,
            name: student.name,
            class: student.class?.name || 'N/A',
            image: student.image || '/user.png',
            studentId: student.studentId,
        }));

        // Get all classes for this school
        const classes = await Class.find({ school: schoolObjectId }).select('_id name');
        const classIds = classes.map(cls => cls._id);

        // ✅ Calculate task counts per term for the selected level using SchoolTask
        const termTaskCounts = await SchoolTask.aggregate([
            {
                $match: {
                    school: schoolObjectId
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
                    "taskDoc.level": selectedLevel,
                    "taskDoc.status": { $in: ['Assigned', 'Active'] }
                }
            },
            {
                $group: {
                    _id: "$term",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const termCounts = termTaskCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {} as Record<number, number>);

        // ✅ Calculate task counts per week for the selected term and level using SchoolTask
        const weekTaskCounts = await SchoolTask.aggregate([
            {
                $match: {
                    school: schoolObjectId,
                    term: selectedTerm
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
                    "taskDoc.level": selectedLevel,
                    "taskDoc.status": { $in: ['Assigned', 'Active'] }
                }
            },
            {
                $group: {
                    _id: "$week",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const weekCounts = weekTaskCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {} as Record<number, number>);

        // ✅ Find all school tasks that match the filter criteria and have latest submissions
        const schoolTasksWithSubmissions = await SchoolTask.aggregate([
            {
                $match: {
                    school: schoolObjectId,
                    term: selectedTerm,
                    week: selectedWeek
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
                    "taskDoc.level": selectedLevel,
                    "taskDoc.status": { $in: ['Assigned', 'Active'] }
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
                                        { $in: ["$classId", classIds] },
                                        { $in: ["$student", studentIds] },
                                        { $eq: ["$term", selectedTerm] },
                                        { $eq: ["$week", selectedWeek] }
                                    ]
                                }
                            }
                        },
                        {
                            $sort: { submittedAt: -1 }
                        }
                    ],
                    as: "results"
                }
            },
            {
                $lookup: {
                    from: "questions",
                    localField: "taskDoc.questions",
                    foreignField: "_id",
                    as: "questionDocs"
                }
            },
            {
                $addFields: {
                    latestSubmission: { $arrayElemAt: ["$results.submittedAt", 0] },
                    submissions: { $size: "$results" },
                    totalScore: { $sum: "$results.score" }
                }
            },
            {
                $sort: { latestSubmission: -1 }
            }
        ]);

        const formattedTasks = schoolTasksWithSubmissions.map(item => {
            const task = item.taskDoc;
            const results = item.results || [];
            const submissions = results.length;
            const totalScore = item.totalScore || 0;
            const avgScore = submissions > 0 ? Math.round(totalScore / submissions) : 0;
            const maxScore = item.questionDocs?.length * 10 || 100;

            return {
                _id: task._id,
                topic: task.topic || 'Topic XYZ',
                category: task.category || 'Quiz',
                level: task.level,
                score: avgScore,
                maxScore: maxScore,
                submissions: submissions,
                status: task.status || 'Assigned',
                totalquestions: item.questionDocs?.length || 0,
                term: item.term,
                week: item.week,
                createdAt: task.createdAt,
                postQuizFeedback: task.postQuizFeedback || false,
                latestSubmission: item.latestSubmission,
                answers: results.map((r: any) => ({
                    student: r.student,
                    score: r.score,
                    answers: r.answers
                }))
            };
        });

        return NextResponse.json({
            teacherCount,
            studentCount,
            tasks: formattedTasks,
            students: formattedStudents,
            classes: classes.map(c => ({ _id: c._id, name: c.name })),
            termTaskCounts: termCounts,
            weekTaskCounts: weekCounts,
            hasData: formattedTasks.length > 0
        }, { status: 200 });

    } catch (error) {
        console.error("schooldashboard error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
