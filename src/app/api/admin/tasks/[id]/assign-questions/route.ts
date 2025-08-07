// /api/admin/tasks/[id]/assign-questions/route.ts

import { connectDB } from '@/utils/db';
import Task from '@/models/Task';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, context: any) {
  await connectDB();
  const body = await req.json(); // expects { questionIds: [...] }
  const { params } =await context;
  const updatedTask = await Task.findByIdAndUpdate(
    params.id,
    { $addToSet: { questions: { $each: body.questionIds } } },
    { new: true }
  );

  return NextResponse.json({ success: true, task: updatedTask });
}