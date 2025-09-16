import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Task from "@/models/Task";
import Student from "@/models/Student";
import TaskResult from "@/models/TaskResult";
import mongoose from "mongoose";

//assign-task to student 
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        await connectDB();

        const { schoolId } = await params;
        const { taskIds, week = 1, term = 1, level = "PRE_A1" } = await req.json();

        if (!taskIds || taskIds.length === 0) {
            return NextResponse.json({ message: "Task IDs are required" }, { status: 400 });
        }
        if (!term || !week) {
            return NextResponse.json({ message: " term, and week are required" }, { status: 400 });
        }

        // Get students for this school + level
        const students = await Student.find({ school: schoolId, level })
            .select("class")
            .lean();

        if (students.length === 0) {
            return NextResponse.json({ message: "No students found for this level" });
        }

        // Get tasks with questions
        const tasks = await Task.find({ _id: { $in: taskIds } })
            .populate("questions")
            .lean();

        const results: any[] = [];

        for (const student of students) {
            for (const task of tasks) {
                // 🔎 Check if TaskResult already exists for this student, task, term & week
                const exists = await TaskResult.exists({
                    student: student._id,
                    task: task._id,
                    term,
                    week,
                });

                if (exists) continue; // ✅ skip if already assigned

                // Prepare empty answers
                const evaluatedAnswers = task.questions.map((q: any) => ({
                    question: q._id,
                    selected: "",
                    isCorrect: false,
                }));

                results.push({
                    student: student._id,
                    task: task._id,
                    score: 0,
                    classId: student.class,
                    term,
                    week,
                    answers: evaluatedAnswers,
                    evaluationStatus: "pending",
                });
            }
        }

        if (results.length > 0) {
            // Insert TaskResults
            const inserted = await TaskResult.insertMany(results);

            if (inserted) {
                // ✅ FIXED: Update multiple tasks with term and week using updateMany
                await Task.updateMany(
                    { _id: { $in: taskIds } }, // Filter: tasks with IDs in the array
                    {
                        $set: {
                            term: term,
                            week: week,
                            lastAssigned: new Date() // Optional: track when task was last assigned
                        }
                    }
                );
            }
        }

        return NextResponse.json({
            success: true,
            created: results.length,
            message:
                results.length > 0
                    ? "Task results assigned to students"
                    : "No new task results created (all already assigned)",
        });
    } catch (error) {
        console.error("Error assigning tasks:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


//unassign-task to student 
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        await connectDB();

        const { schoolId } = await params;
        const { taskIds, week = 1, term = 1, level = "PRE_A1" } = await req.json();

        if (!taskIds || taskIds.length === 0) {
            return NextResponse.json({ message: "Task IDs are required" }, { status: 400 });
        }
        if (!term || !week) {
            return NextResponse.json({ message: "term, and week are required" }, { status: 400 });
        }

        // Get students for this school + level
        const students = await Student.find({ school: schoolId, level })
            .select("_id") // Only need the _id for deletion
            .lean();

        if (students.length === 0) {
            return NextResponse.json({ message: "No students found for this level" });
        }

        const studentIds = students.map(student => student._id);

        const deleteResult = await TaskResult.deleteMany({
            task: { $in: taskIds },
            student: { $in: studentIds }
        });

        return NextResponse.json({
            message: "Task results deleted successfully",
            deletedCount: deleteResult.deletedCount
        });

    } catch (error) {
        console.error("Error deleting task results:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}


export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        await connectDB();
        const { schoolId } = await params;
        if (!mongoose.Types.ObjectId.isValid(schoolId)) {
            return NextResponse.json(
                { success: false, error: "Invalid school ID" },
                { status: 400 }
            );
        }

        // First, get all students from this school
        const students = await Student.find({ school: schoolId})
            .select("_id")
            .lean();

        if (students.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const studentIds = students.map(student => student._id);

        // Aggregate: get distinct task results for students from this school
        const uniqueTaskResults = await TaskResult.aggregate([
            // Match only task results from students of this school and exclude null tasks
            {
                $match: {
                    student: { $in: studentIds },
                    task: { $ne: null } // Exclude documents where task is null
                }
            },
            // Group by task to get distinct tasks
            {
                $group: {
                    _id: "$task",                  // group by task ObjectId
                    doc: { $first: "$$ROOT" },    // take first document per group
                },
            },
            {
                $replaceRoot: { newRoot: "$doc" }, // output original document structure
            },
            // Sort by creation date (optional)
            {
                $sort: { createdAt: -1 }
            }
        ]);

        // Populate task field separately (aggregate does not auto-populate)
        const populatedResults = await TaskResult.populate(uniqueTaskResults, {
            path: "task",
        });

        return NextResponse.json(populatedResults, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching task results:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
