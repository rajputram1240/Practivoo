import Student from "@/models/Student";
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";
import { connectDB } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        await connectDB();

        const { schoolId } = await params;
        const { taskIds, week, term, level } = await req.json();
        console.log(taskIds)
        if (!taskIds || taskIds.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Task IDs are required"
            }, { status: 400 });
        }

        // First, get all students from this school
        const students = await Student.find({ school: schoolId })
            .select("_id")
            .lean();

        if (students.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const studentIds = students.map(student => student._id);
        const ifsubmitted = await TaskResult.find({
            task: { $in: taskIds },
            student: { $in: studentIds },
        });
        console.log(ifsubmitted)
        if (ifsubmitted.length != 0) {
            console.log("Already assigned to student ")
            return NextResponse.json({ message: "Task in use by student " }, { status: 400 });
        }

        const assignedTask = await Task.updateMany(
            { _id: { $in: taskIds } },
            { $unset: { term: "", week: "" } }
        )

        console.log(assignedTask)

        return NextResponse.json({
            message: "Task unassigned successfully",
        });

    } catch (error) {
        console.error("Error deleting task results:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}