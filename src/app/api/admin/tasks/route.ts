import { connectDB } from '@/utils/db';
import Task from '@/models/Task';
import Question from '@/models/Question';
import { NextRequest, NextResponse } from 'next/server';
import Teacher from '@/models/Teacher';
import Student from '@/models/Student';
import Notification from '@/models/Notification';

export async function GET() {
  await connectDB();
  console.log(Question.find({}));
  const tasks = await Task.find().sort({ createdAt: -1 }).populate('questions');
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const task = await Task.create(body);
  const schoolId = "64ab00000000000000000001"
  const [teachers, students] = await Promise.all([
    Teacher.find({ school: schoolId }).select("_id"),
    Student.find({ school: schoolId }).select("_id"),
  ]);

  const receivers = [...teachers, ...students];

  const notifications = receivers.map((user) => ({
    receiver: user._id,
    type: "TASK",
    message: `New task assigned: ${task.topic}`,
    refId: task._id,
    refModel: "Task",
  }));
  console.log("notification", notifications);
  await Notification.insertMany(notifications);

  return NextResponse.json({ success: true, taskData: task }, { status: 200 });
}