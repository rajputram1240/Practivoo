import { connectDB } from "@/utils/db";
import Level from "@/models/Level";
import SchoolLevel from "@/models/SchoolLevel";
import { NextResponse } from "next/server";

// GET /api/levels?schoolId=123
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");

  const levels = await Level.find({});
  if (!schoolId) {
    return NextResponse.json(levels);
  }

  const overrides = await SchoolLevel.find({ schoolId });
  const overrideMap = Object.fromEntries(overrides.map(o => [o.levelCode, o.customName]));

  const merged = levels.map((l) => ({
    code: l.code,
    name: overrideMap[l.code] || l.defaultName,
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