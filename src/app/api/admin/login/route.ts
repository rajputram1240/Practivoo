import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import AdminModel from "@/models/Admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();
    if (!identifier || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    await connectDB();

    const email = String(identifier).toLowerCase();
    const admin = await AdminModel.findOne({ email });
    if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

    // Sign JWT
    const token = jwt.sign(
      { id: admin._id.toString(), role: "admin" },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Build response payload (no need to return the token body)
    const res = NextResponse.json({
      user: {
        id: admin._id,
        email: admin.email,
        role: "admin",
        name: admin.name || "Admin",
      },
    });

    // Set HttpOnly cookie that middleware will read
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (error) {
    console.error("[ADMIN_LOGIN_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}