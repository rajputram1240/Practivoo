import { connectDB } from '@/utils/db';
import Task from '@/models/Task';
import Question from '@/models/Question';
import { NextRequest, NextResponse } from 'next/server';

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
  return NextResponse.json({ success: true, data: task }, { status: 200 });
}