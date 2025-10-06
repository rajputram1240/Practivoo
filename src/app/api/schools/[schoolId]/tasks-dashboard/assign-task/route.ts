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
        const { taskIds, week, term, level } = await req.json();

        if (!taskIds || taskIds.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Task IDs are required"
            }, { status: 400 });
        }

        if (!term || !week) {
            return NextResponse.json({
                success: false,
                message: "Term and week are required"
            }, { status: 400 });
        }

        console.log(taskIds, week, term, level);

        // Check if tasks already have term and week assigned
        const existingTasksName = await Task.find({
            _id: { $in: taskIds },
            level,
            $and: [
                { term: { $exists: true, $ne: null } },
                { week: { $exists: true, $ne: null } }
            ]
        }).select('_id');

        console.log("existingTasksName", existingTasksName);

        if (existingTasksName.length > 0) {
            return NextResponse.json({
                success: false,
                message: "Some tasks are already assigned to a term and week"
            }, { status: 400 });
        }

        // Update tasks
        const result = await Task.updateMany(
            {
                _id: { $in: taskIds },
                level,
            },
            {
                $set: {
                    term,
                    week
                }
            }
        );

        console.log("Update result:", result);

        if (result.modifiedCount === 0) {
            return NextResponse.json({
                success: false,
                message: "No tasks were updated. They may already be assigned."
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: `${result.modifiedCount} tasks assigned to term ${term}, week ${week}`
        }, { status: 200 }); // Fixed: Changed from 400 to 200

    } catch (error) {
        console.error("Error assigning tasks:", error);
        return NextResponse.json({
            success: false,
            message: "Internal server error occurred. Please try again later."
        }, { status: 500 });
    }
}

/* //unassign-task to student 
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        await connectDB();

        const { schoolId } = await params;
        const { taskIds, week, term, level } = await req.json();

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
 */

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
        const students = await Student.find({ school: schoolId })
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
