import Task from "@/models/Task";        
import TaskResult from "@/models/TaskResult";
import { connectDB } from "@/utils/db";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        await connectDB();
        const { schoolId } = await params;

        // Validate schoolId
        if (!mongoose.Types.ObjectId.isValid(schoolId)) {
            return NextResponse.json(
                { success: false, error: "Invalid school ID" },
                { status: 400 }
            );
        }

        // Aggregate: group by 'task' field to get unique tasks
        const uniqueTaskResults = await TaskResult.aggregate([
            {
                $group: {
                    _id: "$task",                  // group by task ObjectId
                    doc: { $first: "$$ROOT" },    // take first document per group
                },
            },
            {
                $replaceRoot: { newRoot: "$doc" }, // output original document structure
            },
        ]);

        // Populate task field separately (aggregate does not auto-populate)
        const populatedResults = await TaskResult.populate(uniqueTaskResults, { path: "task" });

        return NextResponse.json(populatedResults, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching task results:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

