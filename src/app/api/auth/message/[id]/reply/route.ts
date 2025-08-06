import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/utils/db";
import UserMessage from "@/models/UserMessage";

interface JwtPayload {
  id: string;
  role: "student" | "teacher";
}

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  if (decoded.role !== "student") {
    return NextResponse.json({ error: "Only students can reply" }, { status: 403 });
  }

  const { text } = await req.json();
  if (!text || text.trim() === "") {
    return NextResponse.json({ error: "Reply text is required" }, { status: 400 });
  }

  const message = await UserMessage.findById(params.id);
  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  message.replies.push({
    student: decoded.id,
    text,
    createdAt: new Date(),
  });

  await message.save();

  return NextResponse.json({ success: true, replies: message.replies });
}