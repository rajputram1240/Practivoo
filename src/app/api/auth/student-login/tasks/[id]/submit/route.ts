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
    // Authenticate student
    const decoded = verifyToken(req);
    const student = await Student.findById(decoded.id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    // Parse answers
    const { answers, term = 1, week = 1 } = await req.json();

    // Fetch task and its questions
    const task = await Task.findById(id).populate({ path: 'questions', model: Question });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    let correct = 0;
    const evaluatedAnswers = [];

    // Utility to compare arrays exactly
    const arraysEqual = (a: any[] = [], b: any[] = []) => {
      if (a.length !== b.length) return false;
      return a.every((val, index) => val === b[index]);
    };

    for (const q of task.questions) {
      const answer = answers.find((a: any) => a.questionId === q._id.toString());
      const selected = Array.isArray(answer?.selected) ? answer.selected : [];

      let isCorrect = false;

      if (q.questiontype === "Match The Pairs") {
        isCorrect = arraysEqual(selected, q.correctAnswer);
      } else {
        // For other question types, use existing exact match logic
        isCorrect = arraysEqual(selected, q.correctAnswer);
      }

      if (isCorrect) correct++;

      evaluatedAnswers.push({
        question: q._id,
        selected,
        isCorrect,
      });
    }
    const score = correct;

    // Upsert result for this student and task
    await TaskResult.findOneAndUpdate(
      { student: student._id, task: task._id },
      {
        answers: evaluatedAnswers,
        score,
        classId: student.class,
        term,
        week
      },
      { upsert: true, new: true }
    );

    // Calculate weekly stats for the student
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