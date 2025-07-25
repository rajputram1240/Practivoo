import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Teacher from '@/models/Teacher';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { teacherId, password } = await req.json();

    if (!teacherId || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    await connectDB();

    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, teacher.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: teacher._id, role: 'teacher', teacherId: teacher.teacherId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      token,
      user: {
        id: teacher._id,
        teacherId: teacher.teacherId,
        role: 'teacher',
      },
    });
  } catch (error) {
    console.error('[TEACHER_LOGIN_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}