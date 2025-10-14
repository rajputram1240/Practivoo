import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Student from '@/models/Student';
import Task from '@/models/Task';
import TaskResult from '@/models/TaskResult';
import { verifyToken } from '@/utils/verifyToken';
import schooltask from '@/models/schooltask';

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

  const { level, school } = student;
  console.log('Level:', level, 'School:', school);
  console.log('Student ID:', student._id);

  // Fetch schooltasks for the student's school and filter by level using populate match
  const schoolTasks = await schooltask
    .find({
      school: school,
    })
    .populate({
      path: 'task',
      model: Task,
      match: { level: level }, // This sets non-matching to null
    })
    .lean();

  // Filter out documents where task is null
  const filteredSchoolTasks = schoolTasks.filter(st => st.task !== null);

  console.log('School Tasks:', filteredSchoolTasks);

  // Filter out entries where task is null (didn't match level)
  const filteredTasks = schoolTasks.filter(st => st.task !== null);

  console.log('Filtered Tasks:', filteredTasks);

  // Extract task IDs for checking completion status
  const taskIds = filteredTasks.map(st => st.task._id.toString());

  // Fetch completed task IDs with scores
  const taskResults = await TaskResult.find({
    student: student._id,
    task: { $in: taskIds }
  }).lean();

  const completedTaskIds = taskResults.map(result => result.task.toString());
  console.log("Completed tasks:", completedTaskIds);

  const enrichedTasks = filteredTasks.map(st => ({
    _id: st.task._id,
    topic: st.task.topic,
    level: st.task.level,
    category: st.task.category,
    status: completedTaskIds.includes(st.task._id.toString()) ? 'Completed' : 'Pending',
    questions: st.task.questions,
    postQuizFeedback: st.task.postQuizFeedback,
    createdAt: st.task.createdAt,
    term: st.term,
    week: st.week,
    __v: st.task.__v
  }));

  console.log('Enriched Tasks:', enrichedTasks);

  const totalTasks = enrichedTasks.length;
  const completed = enrichedTasks.filter(t => t.status === 'Completed').length;
  const pending = totalTasks - completed;

  // Fetch actual max/min score from TaskResult
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
    },
    tasks: enrichedTasks,
  });
}