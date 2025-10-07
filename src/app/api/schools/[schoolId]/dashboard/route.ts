import Student from "@/models/Student";
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";
import Teacher from "@/models/Teacher";
import Class from "@/models/Class";
import Question from "@/models/Question";
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
        const selectedLevel = searchParams.get('level') || 'PRE_';

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

        // ✅ Calculate task counts per term for the selected level
        const termTaskCounts = await Task.aggregate([
            {
                $match: {
                    level: selectedLevel,
                    status: { $in: ['Assigned', 'Active'] }
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

        // Convert to object: { 1: 5, 2: 3, 3: 7, 4: 2 }
        const termCounts = termTaskCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {} as Record<number, number>);

        // ✅ Calculate task counts per week for the selected term and level
        const weekTaskCounts = await Task.aggregate([
            {
                $match: {
                    level: selectedLevel,
                    term: selectedTerm,
                    status: { $in: ['Assigned', 'Active'] }
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

        // Find all tasks that match the filter criteria
        const filteredTasks = await Task.find({
            term: selectedTerm,
            week: selectedWeek,
            level: selectedLevel,
            status: { $in: ['Assigned', 'Active'] }
        })
            .populate({
                path: 'questions',
                model: Question,
                select: 'question type'
            })
            .sort({ createdAt: -1 });

        const formattedTasks = [];

        for (const task of filteredTasks) {
            const results = await TaskResult.find({
                task: task._id,
                classId: { $in: classIds },
                student: { $in: studentIds }
            });

            const submissions = results.length;
            const totalScore = results.reduce((acc, r) => acc + (r.score || 0), 0);
            const avgScore = submissions > 0 ? Math.round(totalScore / submissions) : 0;
            const maxScore = task.questions?.length * 10 || 100;

            formattedTasks.push({
                _id: task._id,
                topic: task.topic || 'Topic XYZ',
                category: task.category || 'Quiz',
                level: task.level,
                score: avgScore,
                maxScore: maxScore,
                submissions: submissions,
                status: task.status || 'Assigned',
                totalquestions: task.questions?.length || 0,
                term: task.term,
                week: task.week,
                createdAt: task.createdAt,
                postQuizFeedback: task.postQuizFeedback || false,
                answers: results.map(r => ({
                    student: r.student,
                    score: r.score,
                    answers: r.answers
                }))
            });
        }

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
