import { connectDB } from '@/utils/db';
import Task from '@/models/Task';
import { NextRequest, NextResponse } from 'next/server';
import TaskResult from '@/models/TaskResult';
import Question from '@/models/Question';


// PUT /api/admin/tasks/[id]
export async function PUT(req: NextRequest, context: any) {
  await connectDB();

  const { id } =await context.params;
  const body = await req.json();

  const task = await Task.findByIdAndUpdate(id, { topic: body.topic }, { new: true });
  
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ task }, { status: 200 });
}

// DELETE /api/admin/tasks/[id]
export async function DELETE(_: NextRequest, context: any) {
  await connectDB();

  const { id } =await context.params;

  const count = await TaskResult.countDocuments({ task: id });
  if (count > 0) {
    return NextResponse.json({ success: false, message: "Task is in use and can't be deleted." }, { status: 400 });
  }

  const deleted = await Task.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Task deleted" }, { status: 200 });
}


export async function PATCH(req: NextRequest, context: any) {
  await connectDB();
   const { params } =await context;
  const task = await Task.findById(params.id);

   const count = await TaskResult.countDocuments({ task: params.id });
  if (count > 0) {
    return NextResponse.json({ success: false, message: "Task is in use and its status cannot be changed." }, { status: 400 });
  }

  if (!task) {
    return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
  }

  task.status = task.status === 'Assigned' ? 'Drafts' : 'Assigned';
  await task.save();

  return NextResponse.json({ success: true, task }, { status: 200 });
}
