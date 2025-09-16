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
        const searchQuery = searchParams.get('search') || '';

        const { schoolId } = await params;
        const schoolObjectId = new mongoose.Types.ObjectId(schoolId);

        // Get total counts
        const teacherCount = await Teacher.countDocuments({ school: schoolObjectId });
        const studentCount = await Student.countDocuments({ school: schoolObjectId });

        // Get students with search functionality
        let studentFilter: any = { school: schoolObjectId };
        if (searchQuery) {
            studentFilter.name = { $regex: searchQuery, $options: 'i' };
        }

        const students = await Student.find(studentFilter)
            .populate('class', 'name')
            .select('name class image studentId')
            .sort({ name: 1 });

        // Format students for UI
        const formattedStudents = students.map(student => ({
            _id: student._id,
            name: student.name,
            class: student.class?.name || 'N/A',
            image: student.image || '/user.png',
            studentId: student.studentId,
        }));

        // Get all classes for this school
        const classes = await Class.find({ school: schoolObjectId }).select('_id name');
        const classIds = classes.map(cls => cls._id);

        // Get all tasks first, then filter by school's classes AND selected term/week
        const allTasks = await Task.find()
            .populate({
                path: 'questions',
                model: Question,
                select: 'question type'
            })
            .sort({ createdAt: -1 });

        const formattedTasks = [];

        for (const task of allTasks) {
            // ✅ UPDATED: Filter task results by selected term and week
            const results = await TaskResult.find({
                task: task._id,
                classId: { $in: classIds }, // Only results from this school's classes
                term: selectedTerm,         // ✅ Filter by selected term
                week: selectedWeek         // ✅ Filter by selected week
            });

            // Skip tasks with no results from this school for the selected term/week
            if (results.length === 0) continue;

            const submissions = results.length;
            const totalScore = results.reduce((acc, r) => acc + (r.score || 0), 0);
            const avgScore = submissions > 0 ? Math.round(totalScore / submissions) : 0;
            const maxScore = task.questions?.length * 10 || 100;

            formattedTasks.push({
                _id: task._id,
                title: task.topic || 'Topic XYZ',
                type: task.category || 'Quiz/Test/Assignment',
                score: `${avgScore}/${maxScore}`,
                submissions: submissions,
                status: task.status || 'Assigned',
                questionsCount: task.questions?.length || 0,
                term: task.term || 1,
                week: task.week || 1,

            });
        }

        // ✅ UPDATED: Get weekly stats for the selected term only
        const weeklyTaskCounts: Record<string, number> = {};
        for (let week = 1; week <= 12; week++) {
            const count = await TaskResult.countDocuments({
                classId: { $in: classIds },
                term: selectedTerm,    // ✅ Filter by selected term
                week: week
            });
            weeklyTaskCounts[`Week ${week}`] = count;
        }

        // Get term statistics (this remains the same as it covers all terms)
        const termStats: Record<string, { tasks: number; submissions: number }> = {};
        for (let term = 1; term <= 3; term++) {
            // Count submissions for this school in this term
            const submissionCount = await TaskResult.countDocuments({
                classId: { $in: classIds },
                term: term
            });

            // Count unique tasks that have submissions from this school
            const uniqueTasks = await TaskResult.distinct('task', {
                classId: { $in: classIds },
                term: term
            });

            termStats[`Term ${term}`] = {
                tasks: uniqueTasks.length,
                submissions: submissionCount
            };
        }

        // ✅ UPDATED: Get recent submissions filtered by selected term and week
        const recentSubmissions = await TaskResult.find({
            classId: { $in: classIds },
            term: selectedTerm,    // ✅ Filter by selected term
            week: selectedWeek     // ✅ Filter by selected week
        })
            .populate('student', 'name image')
            .populate('task', 'topic')
            .sort({ createdAt: -1 })
            .limit(10);

        const formattedSubmissions = recentSubmissions.map(submission => ({
            _id: submission._id,
            studentName: submission.student?.name || 'Unknown',
            studentImage: submission.student?.image || '/user.png',
            taskTitle: submission.task?.topic || 'Unknown Task',
            score: submission.score,
            term: submission.term,
            week: submission.week,
            createdAt: submission.createdAt,
        }));

        // ✅ NEW: Add a flag to indicate if there's data for the current selection
        const hasData = formattedTasks.length > 0 || recentSubmissions.length > 0;

        return NextResponse.json({
            // Basic counts
            teacherCount,
            studentCount,

            // Students list
            students: formattedStudents,

            // Tasks filtered by selected term/week
            tasks: formattedTasks,

            // Weekly statistics for selected term
            weeklyStats: weeklyTaskCounts,

            // Term statistics (all terms)
            termStats,

            // Recent activity for selected term/week
            recentSubmissions: formattedSubmissions,

            // ✅ NEW: Data availability flag
            hasData,

            // Current filters
            currentFilters: {
                term: selectedTerm,
                week: selectedWeek,
                search: searchQuery
            },

            // Available options
            availableTerms: [
                { value: 1, label: 'Term 1' },
                { value: 2, label: 'Term 2' },
                { value: 3, label: 'Term 3' }
            ],

            availableWeeks: Array.from({ length: 12 }, (_, i) => ({
                value: i + 1,
                label: `Week ${i + 1}`
            })),

            classes: classes.map(cls => ({
                _id: cls._id,
                name: cls.name
            }))
        }, { status: 200 });

    } catch (error) {
        console.error("schooldashboard error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
