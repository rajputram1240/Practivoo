import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';
import Task from '@/models/Task';
import schooltask from '@/models/schooltask';
import TaskResult from '@/models/TaskResult';

export async function PUT(
  req: NextRequest,
  context: any
) {
  await connectDB();
  const body = await req.json();
  const { id } = await context.params;

  try {
    //  Hash password before update if password is provided
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    }
    const updated = await Student.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    const { password, ...studentWithoutPassword } = updated.toObject();
    return NextResponse.json(
      { message: "Updated successfully", data: studentWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}



export async function DELETE(
  req: Request,
  context: any
) {
  await connectDB();
  const { id } = context.params;

  try {
    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
export async function GET(req: NextRequest, context: any) {
  await connectDB();
  let student;
  const { id } = await context.params;

  // Extract term and week from query parameters
  const url = new URL(req.url);
  const term = url.searchParams.get('term') || 1;
  const week = url.searchParams.get('week') || 1;

  try {
    student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }
  } catch (err) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const { level, school } = student;

  const query: any = { school };
  if (term) query.term = term;
  if (week) query.week = week;

  // Fetch schooltasks for the student's school with optional term/week filters
  const schoolTasks = await schooltask
    .find(query)
    .populate({
      path: 'task',
      model: Task,
      match: { level: level },
    })
    .lean();

  const filteredTasks = schoolTasks.filter(st => st.task !== null);

  // Remaining code unchanged...
  const taskIds = filteredTasks.map(st => st.task._id.toString());

  const taskResults = await TaskResult.find({
    student: student._id,
    task: { $in: taskIds }
  }).lean();

  const completedTaskIds = taskResults.map(result => result.task.toString());

  const enrichedTasks = filteredTasks.map(st => ({
    _id: st.task._id,
    topic: st.task.topic,
    level: st.task.level,
    category: st.task.category,
    status: completedTaskIds.includes(st.task._id.toString()) ? 'Completed' : 'Pending',
    createdAt: st.task.createdAt,
    term: st.term,
    week: st.week,
    __v: st.task.__v
  }));

  const totalTasks = enrichedTasks.length;
  const completed = enrichedTasks.filter(t => t.status === 'Completed').length;
  const pending = totalTasks - completed;

  const scores = taskResults.map(t => t.score);
  const maxScore = scores.length ? Math.max(...scores) : 0;
  const minScore = scores.length ? Math.min(...scores) : 0;

  return NextResponse.json({
    weeklyReport: {
      totalTasks,
      completed,
      pending,
      maxScore,
      minScore,
      scores
    },
    tasks: enrichedTasks,
  });
}
