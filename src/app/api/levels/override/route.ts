import { connectDB } from "@/utils/db";
import SchoolLevel from "@/models/SchoolLevel";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Class from "@/models/Class";
import Level from "@/models/Level";

export async function POST(req: Request) {
  await connectDB();
  const { schoolId, levelCode, customName } = await req.json();

  const updated = await SchoolLevel.findOneAndUpdate(
    { schoolId, levelCode },
    { customName, modifiedAt: new Date() },
    { upsert: true, new: true }
  );

  return NextResponse.json(updated);
}

export async function GET(req: Request) {
  await connectDB();
  const levels = await Level.find().sort({ order: 1, code: 1 }).select("defaultName");
  console.log(levels)
  return NextResponse.json({ levels }, { status: 200 });
}

