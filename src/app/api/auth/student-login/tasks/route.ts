import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Student from '@/models/Student';
import Task from '@/models/Task';
import TaskResult from '@/models/TaskResult';
import { verifyToken } from '@/utils/verifyToken';


export async function GET(req: NextRequest) {
  await connectDB();
  let student;
  try {
    const decoded = verifyToken(req);
    student = await Student.findById(decoded.id);
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }
  } catch (err) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const { level } = student;
  console.log(level)
  console.log(student._id)
  // Fetch tasks for the student's level
  const tasks = await Task.find({ level }).lean();
  console.log(tasks);
  // Fetch completed task IDs
  const taskResults = await TaskResult.find({ student: student._id }, 'task');
  console.log("taskresult",taskResults)
  const completedTaskIds = taskResults.map(result => result.task.toString());
  console.log("completedtask",completedTaskIds)
  
  const enrichedTasks = tasks.map(task => ({
    ...task,
    status: completedTaskIds.includes(String(task._id)) ? 'Completed' : 'Pending',
  }));
  console.log(enrichedTasks)

  const totalTasks = tasks.length;
  const completed = enrichedTasks.filter(t => t.status === 'Completed').length;
  const pending = totalTasks - completed;

  // Optional: fetch actual max/min score from TaskResult
  const taskScores = await TaskResult.find({ student: student._id }, 'score');
  const scores = taskScores.map(t => t.score);
  const maxScore = scores.length ? Math.max(...scores) : 0;
  const minScore = scores.length ? Math.min(...scores) : 0;

  return NextResponse.json({
    weeklyReport: {
      totalTasks,
      completed,
      pending,
      maxScore,
      minScore,
    },
    tasks: enrichedTasks,
  });
}