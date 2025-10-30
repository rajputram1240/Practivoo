import { connectDB } from "@/utils/db";
import Level from "@/models/Level";
 import { NextResponse } from "next/server";

// GET /api/levels?schoolId=123
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");

  const levels = await Level.find().sort({ order: 1 });
  if (!schoolId) {
    return NextResponse.json(levels);
  } 
  const merged = levels.map((l) => ({
    code: l.code,
    name:  l.defaultName,
  }));
  return NextResponse.json(merged);
}

// POST /api/levels (admin creates)
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const newLevel = await Level.create({
    code: body.code,
    defaultName: body.defaultName,
    createdBy: "admin"
  });

  return NextResponse.json(newLevel);
}