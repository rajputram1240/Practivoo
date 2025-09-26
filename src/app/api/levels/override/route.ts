import { connectDB } from "@/utils/db";
import SchoolLevel from "@/models/SchoolLevel";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

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
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");
  const all = searchParams.get("all");

  // ✅ GET ALL SCHOOL LEVELS
  if (all === "true") {
    try {
      const levels = await SchoolLevel.find({}).lean();
      console.log(levels)
      return NextResponse.json({ levels });
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch all levels" }, { status: 500 });
    }
  }

  // ✅ GET BY SCHOOL ID
  if (!schoolId) {
    return NextResponse.json({ error: "Missing schoolId or all=true" }, { status: 400 });
  }

  let objectId: mongoose.Types.ObjectId;
  try {
    objectId = new mongoose.Types.ObjectId(schoolId);
  } catch (error) {
    return NextResponse.json({ error: "Invalid ObjectId format" }, { status: 400 });
  }

  console.log("Querying SchoolLevel with:", objectId.toString());

  const levels = await SchoolLevel.find({ schoolId: objectId }).lean();

  return NextResponse.json({ levels });
}