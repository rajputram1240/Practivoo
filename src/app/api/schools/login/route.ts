import { connectDB } from "@/utils/db";
import School from "@/models/School";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();

  const { identifier, password } = await req.json();
  const email = identifier.toLowerCase(); // Force lowercase match

  const school = await School.findOne({ email });

  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const isMatch = await bcrypt.compare(password, school.password);
  if (!isMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({
    _id: school._id,
    name: school.name,
    email: school.email,
    token: "mock-token",
  });
}