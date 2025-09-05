import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import School from '@/models/School';
import Teacher from '@/models/Teacher';
import Student from '@/models/Student';

// GET /api/admin/schools
export async function GET() {
  await connectDB();
  const allschools = await School.find({});
  console.log(allschools);
  const schools = await Promise.all(
    allschools.map(async (school) => {
      const teacherCount = await Teacher.countDocuments({ school: school._id });
      const studentCount = await Student.countDocuments({ school: school._id });

      return {
        ...school.toObject(),
        teacherCount,
        studentCount,
      };
    })
  );
  return NextResponse.json({ success: true, data: schools }, { status: 200 });
}

// POST /api/admin/schools
export async function POST(req: NextRequest) {
  await connectDB();
  const { name, email, password, phone, address } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { success: false, message: 'Name, email, and password are required' },
      { status: 400 }
    );
  }

  const existing = await School.findOne({ email });
  if (existing) {
    return NextResponse.json(
      { success: false, message: 'School with this email already exists' },
      { status: 409 }
    );
  }

  const school = await School.create({ name, email, password, phone, address });
  return NextResponse.json({ success: true, data: school }, { status: 201 });
}

// PUT /api/admin/schools
export async function PUT(req: NextRequest) {
  await connectDB();
  const { id, ...updateData } = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
  }

  delete updateData.password; // Prevent password update

  const updated = await School.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    return NextResponse.json({ success: false, message: 'School not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: updated }, { status: 200 });
}

// DELETE /api/admin/schools
export async function DELETE(req: NextRequest) {
  await connectDB();
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
  }

  const deleted = await School.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ success: false, message: 'School not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'School deleted successfully' }, { status: 200 });
}