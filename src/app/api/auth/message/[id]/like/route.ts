import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/utils/db";
import UserMessage from "@/models/UserMessage";

interface JwtPayload {
  id: string;
  role: "student" | "teacher";
}

const JWT_SECRET = process.env.JWT_SECRET!;

export async function PATCH(req: NextRequest, context: any) {
  await connectDB();
  const { params } =await context;
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
    return NextResponse.json({ error: "Only students can like messages" }, { status: 403 });
  }

  const studentId = decoded.id;

  const message = await UserMessage.findById(params.id);
  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const alreadyLiked = message.likes.includes(studentId);

  if (alreadyLiked) {
    message.likes.pull(studentId); // remove like
  } else {
    message.likes.push(studentId); // add like
  }

  await message.save();

  return NextResponse.json({ liked: !alreadyLiked, likes: message.likes });
}