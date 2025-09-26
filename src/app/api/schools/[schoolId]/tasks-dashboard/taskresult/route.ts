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

        const schoolObjectId = new mongoose.Types.ObjectId(schoolId);

        // Method 1: Using aggregation with lookup to filter by school
        const uniqueTaskResults = await TaskResult.aggregate([
            {
                $lookup: {
                    from: "classes",
                    localField: "classId",
                    foreignField: "_id",
                    as: "classDetails"
                }
            },
            {
                $unwind: "$classDetails"
            },
            {
                $match: {
                    "classDetails.school": schoolObjectId  // Filter by school ID
                }
            },
            {
                $group: {
                    _id: "$task",                  // group by task ObjectId
                    doc: { $first: "$$ROOT" },    // take first document per group
                }
            },
            {
                $replaceRoot: { newRoot: "$doc" } // output original document structure
            },
            {
                $project: {
                    classDetails: 0  // Remove classDetails from final output
                }
            }
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
