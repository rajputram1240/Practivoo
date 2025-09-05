import { connectDB } from '@/utils/db';
import Question from '@/models/Question';
import { NextResponse, NextRequest } from 'next/server';
import { match } from 'assert';

export async function GET() {
  await connectDB();
  const questions = await Question.find().sort({ createdAt: -1 });
  return NextResponse.json({ questions });
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { questions } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Invalid questions data' }, { status: 400 });
    }

    const insertedQuestions = [];

    for (const q of questions) {
      // Basic validation
      
      if (!q.question || !Array.isArray(q.options) /* || q.options.length < 2 */) {
        continue; // skip invalid ones
      }

      const created = await Question.create({
        heading: q.heading || '',
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        matchThePairs: q.matchThePairs ,
        explanation: q.explanation || '',
        media: {
          image: q.media?.image || '',
          audio: q.media?.audio || '',
        },
        questiontype: q.questiontype,
        type: q.type === 'multi' ? 'multi' : 'single',
      });

      insertedQuestions.push(created);
    }

    return NextResponse.json(
      { success: true, count: insertedQuestions.length, questions: insertedQuestions },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating questions:", error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}