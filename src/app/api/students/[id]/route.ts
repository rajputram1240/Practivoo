import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';

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
