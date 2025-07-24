import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db"; // replace with your connection util
import AdminModel from "@/models/Admin"; // your Mongoose or Prisma model
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    await connectDB(); // connect to MongoDB

    const admin = await AdminModel.findOne({ email: identifier });
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      user: {
        id: admin._id,
        email: admin.email,
        role: "admin",
        name: admin.name || "Admin",
      },
    });
  } catch (error) {
    console.error("[ADMIN_LOGIN_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}