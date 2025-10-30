import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Level from '@/models/Level';

export async function PATCH(req: Request, context: any) {
  await connectDB();

  const { id } = await context.params;
  const { levelname } = await req.json();

  const schoolcode = levelname.trim()
  console.log(id, schoolcode)

  if (!schoolcode) {
    return NextResponse.json({ error: 'Missing customName' }, { status: 400 });
  }
  try {
    const updatedLevel = await Level.findByIdAndUpdate(id, { schoolcode: schoolcode }, { new: true });

    if (!updatedLevel) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Level updated', level: updatedLevel });
  } catch (err) {
    console.error('Update Level Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

