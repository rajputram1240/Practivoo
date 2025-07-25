import { connectDB } from '@/utils/db';
import Task from '@/models/Task';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/admin/tasks/[id]
export async function PUT(req: NextRequest, context: any) {
  await connectDB();

  const { id } = context.params;
  const body = await req.json();

  const task = await Task.findByIdAndUpdate(id, body, { new: true });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ task }, { status: 200 });
}

// DELETE /api/admin/tasks/[id]
export async function DELETE(_: NextRequest, context: any) {
  await connectDB();

  const { id } = context.params;

  const deleted = await Task.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({}, { status: 204 });
}