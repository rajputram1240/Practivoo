import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import { connectDB } from '@/utils/db';
import { getTeacherIdFromAuth } from "@/lib/auth";
import ClassModel from "@/models/Class";
import Student from "@/models/Student";
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";
import Notification from "@/models/Notification";

function badId(id?: string) {
    return !id || !mongoose.Types.ObjectId.isValid(id);
}

/**
 * POST /api/teacher/send-reminder
 * Body: { taskId: string, classId: string, message?: string }
 * Auth: Authorization: Bearer <JWT>
 */
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const teacherId = getTeacherIdFromAuth(req);

        const body = await req.json();
        const { taskId, classId, message } = body;

        if (badId(taskId) || badId(classId)) {
            return NextResponse.json({ error: "Valid taskId and classId are required" }, { status: 400 });
        }

        const taskObjId = new mongoose.Types.ObjectId(taskId);
        const classObjId = new mongoose.Types.ObjectId(classId);

        // 1) Authorize: class must belong to this teacher
        const cls = await ClassModel.findOne({ _id: classObjId, teachers: teacherId })
            .select({ name: 1, level: 1 })
            .lean<{ _id: Types.ObjectId; name: string; level: string }>();

        if (!cls) {
            return NextResponse.json({ error: "Class not found for teacher" }, { status: 404 });
        }

        // 2) Get task details
        const task = await Task.findById(taskObjId)
            .select({ topic: 1, level: 1, category: 1, status: 1, term: 1, week: 1 })
            .lean<{
                _id: Types.ObjectId;
                topic: string;
                level: string;
                category: string;
                status: "Assigned" | "Drafts";
                term?: number;
                week?: number;
            }>();

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        // 3) Find students without submissions using aggregation
        const studentsWithoutSubmissions = await Student.aggregate([
            { $match: { class: classObjId } },
            {
                $lookup: {
                    from: "taskresults",
                    let: { sid: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$student", "$$sid"] },
                                        { $eq: ["$task", taskObjId] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "submissions"
                }
            },
            // Filter students with no submissions
            { $match: { submissions: { $size: 0 } } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1
                }
            }
        ]);

        if (studentsWithoutSubmissions.length === 0) {
            return NextResponse.json({
                message: "All students have already submitted this task",
                remindersSent: 0
            });
        }

        // 4) Check if notification exists in last 12 hours
        const last24Hours = new Date(Date.now() - 12 * 60 * 60 * 1000);
        const existingNotification = await Notification.findOne({
            type: "reminder",
            refId: taskObjId,
            refModel: "Task",
            createdAt: { $gte: last24Hours }
        });

        if (existingNotification) {
            return NextResponse.json({
                message: "Reminder already sent wait 12hr for next reminder.",
                success: true
            });
        }

        // 5) Create default reminder message if not provided
        const defaultMessage = message || `Hi! Please don't forget to submit your "${task.topic}" assignment for ${cls.name}. Your submission is still pending.`;

        // 6) Create notifications using your existing schema structure
        const notifications = studentsWithoutSubmissions.map(student => ({
            receiver: student._id, // Using 'receiver' as per your schema
            title: "Task Submission Reminder",
            type: "reminder",
            message: defaultMessage,
            refId: taskObjId, // Reference to the task
            refModel: "Task", // Model name as per your enum
            isRead: false
        }));

        // 7) Bulk insert notifications
        const n = await Notification.insertMany(notifications);

        // 8) Return detailed response
        return NextResponse.json({
            success: true,
            message: `Reminder sent successfully`,
            sentNotifiaction: n.length
        });

    } catch (err: any) {
        console.error("Error sending reminders:", err);
        const msg = err?.message || "Server error";
        const status = /unauthorized/i.test(msg) ? 401 : 500;
        return NextResponse.json({ error: msg }, { status });
    }
}