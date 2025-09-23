import { getTeacherIdFromAuth } from "@/lib/auth";
import ClassModel from "@/models/Class";
import TaskResult from "@/models/TaskResult";
import { connectDB } from "@/utils/db";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {

        await connectDB();
        const teacherId = await getTeacherIdFromAuth(req);
        const teacherObjId = new mongoose.Types.ObjectId(teacherId);
        const classes = await ClassModel.aggregate([
            { $match: { teachers: teacherObjId } },
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
                    id: "$_id",
                    name: 1,
                    level: 1,
                    studentCount: { $size: "$students" }
                }
            },
            { $sort: { name: 1 } }
        ]);
        const classIds = classes.map(cls => cls.id);
        const allevalution = await TaskResult.find({ classId: { $in: classIds } }).select("_id task score  evaluationStatus term week classId").lean();

        console.log(allevalution)
        return NextResponse.json({
            allevalution
        }, { status: 200 });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err?.message || "Server error" }, { status: err?.status || 500 });
    }
}