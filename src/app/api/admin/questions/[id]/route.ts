// src/app/api/admin/questions/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Question from '@/models/Question';
import Task from '@/models/Task'; // ✅ Task model

// ----------- DELETE -----------
export async function DELETE(
  req: Request,
  context: any
) {
  try {
    await connectDB();

    const { id } = context.params;

    // ✅ Check if question is used in any task
    const taskUsingQuestion = await Task.findOne({ questions: id });

    if (taskUsingQuestion) {
      return NextResponse.json(
        { error: 'Cannot delete: Question is assigned to a task.' },
        { status: 400 }
      );
    }

    const deleted = await Question.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ----------- PUT (Update) -----------
export async function PUT(
  req: Request,
  context: any
) {
  try {
    await connectDB();

    const { id } = context.params;
    const updates = await req.json();

    // Prepare the update object with all fields
    const updateData = {
      heading: updates.heading || '',
      question: updates.question,
      options: updates.options,
      correctAnswer: updates.correctAnswer,
      explanation: updates.explanation || '',
      additionalMessage: updates.additionalMessage || '',
      media: {
        image: updates.media?.image || '',
        audio: updates.media?.audio || '',
      },
      matchThePairs: updates.matchThePairs || [],
      questiontype: updates.questiontype,
      type: updates.type === 'multi' ? 'multi' : 'single',
    };

    const updated = await Question.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, question: updated });
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ----------- GET (Fetch) -----------
export async function GET(
  _req: Request,
  context: any
) {
  try {
    await connectDB();

    const { id } = context.params;
    const question = await Question.findById(id);

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ question }, { status: 200 });
  } catch (err) {
    console.error('Error fetching question:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}