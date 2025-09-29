import Student from "@/models/Student";
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
        const student = await Student.find({ school: schoolObjectId }).select('_id level');
        console.log(student)
        const task = await Task.aggregate([
            {
                $match: {
                    level: { $in: student.map(s => s.level) },
                    term: { $exists: true },
                    week: { $exists: true }
                }
            },
            {
                $addFields: {
                    totalquestions: { $size: "$questions" }
                }
            },
            {
                $project: {
                    questions: 0
                }
            }
        ]);



        return NextResponse.json(task, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching task results:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
