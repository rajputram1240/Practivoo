import { connectDB } from "@/utils/db";
import School from "@/models/School";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { identifier, password } = await req.json();
    const email = identifier.toLowerCase();

    const school = await School.findOne({ email });

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, school.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // OPTIONAL: Replace mock-token with JWT token
    const token = jwt.sign({ id: school._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    return NextResponse.json({
      _id: school._id,
      name: school.name,
      email: school.email,
      token, // or "mock-token" if not using JWT
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}