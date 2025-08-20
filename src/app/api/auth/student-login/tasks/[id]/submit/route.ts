import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Task from '@/models/Task';
import Question from '@/models/Question';
import TaskResult from '@/models/TaskResult';
import Student from '@/models/Student';
import { verifyToken } from '@/utils/verifyToken';
import { Types } from 'mongoose'; // 👈 Import mongoose Types

export async function POST(req: NextRequest, context: any) {
  await connectDB();
   const { id } = await context.params;
  try {
    // ✅ Authenticate student
    const decoded = verifyToken(req);
    const student = await Student.findById(decoded.id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    // ✅ Parse answers
    const { answers } = await req.json();

    console.log(await Question.find({}));

    // ✅ Fetch task and its questions
    const task = await Task.findById(id).populate('questions');
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    let correct = 0;
    const evaluatedAnswers = [];

    for (const q of task.questions) {
      const answer = answers.find((a: any) => a.questionId === q._id.toString());
      const isCorrect = answer?.selected === q.correctAnswer;
      if (isCorrect) correct++;

      evaluatedAnswers.push({
        question: q._id,
        selected: answer?.selected || '',
        isCorrect,
      });
    }

    const score = correct;

    // ✅ Update existing result if found, else insert new
    await TaskResult.findOneAndUpdate(
      { student: student._id, task: task._id },
      {
        answers: evaluatedAnswers,
        score,
        classId: student.class
      },
      { upsert: true, new: true }
    );

    // ✅ Calculate weekly stats
    const results = await TaskResult.find({ student: student._id });
    const scores = results.map(r => r.score);
    const maxScore = scores.length ? Math.max(...scores) : 0;
    const minScore = scores.length ? Math.min(...scores) : 0;
    const totalTasks = results.length;

    return NextResponse.json({
      message: 'Submission successful',
      scorePercentage: Math.round((correct / task.questions.length) * 100),
      starsEarned: correct,
      correctAnswers: correct,
      wrongAnswers: task.questions.length - correct,
      totalQuestions: task.questions.length,
      weeklyStats: {
        totalTasks,
        maxScore,
        minScore,
      },
      leaderboard: [
        { class: "Class 1", score: 30 },
        { class: "Class 2", score: 25 },
      ],
    });
  } catch (error) {
    console.error('[SUBMIT_TASK_ERROR]', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}


export async function GET(req: NextRequest, context: any) {
  await connectDB();
   const { id } = await context.params;
  try {
    const decoded = verifyToken(req);
    const student = await Student.findById(decoded.id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

   
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const task = await Task.findById(id).populate('questions');
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const taskResult = await TaskResult.findOne({ student: student._id, task: task._id });
    if (!taskResult) {
      return NextResponse.json({ error: 'Result not found for this task' }, { status: 404 });
    }

const correct = taskResult.answers.filter((a: any) => a.isCorrect).length;
    const wrong = task.questions.length - correct;

    // Weekly Stats
    const allResults = await TaskResult.find({ student: student._id });
    const scores = allResults.map(r => r.score);
    const maxScore = scores.length ? Math.max(...scores) : 0;
    const minScore = scores.length ? Math.min(...scores) : 0;
    const totalTasks = allResults.length;

    return NextResponse.json({
      message: 'Task result fetched successfully',
      scorePercentage: Math.round((correct / task.questions.length) * 100),
      starsEarned: correct,
      correctAnswers: correct,
      wrongAnswers: wrong,
      totalQuestions: task.questions.length,
      weeklyStats: {
        totalTasks,
        maxScore,
        minScore,
      },
      leaderboard: [
        { class: "Class 1", score: 30 },
        { class: "Class 2", score: 25 }
      ]
    });

  } catch (error) {
    console.error('[GET_TASK_RESULT_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch result' }, { status: 500 });
  }
}