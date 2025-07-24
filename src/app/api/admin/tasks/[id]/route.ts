import { connectDB } from '@/utils/db';
import Task from '@/models/Task';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const task = await Task.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json({ task });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  await Task.findByIdAndDelete(params.id);
  return NextResponse.json({}, { status: 204 });
}