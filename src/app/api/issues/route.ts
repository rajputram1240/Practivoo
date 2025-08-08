// app/api/issues/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Issue from "@/models/Issue";

export const dynamic = "force-dynamic"; // avoid static caching for POST/GET

const ALLOWED_TYPES = ["Image", "Audio", "Instruction/Text", "Irrelevant picture", "Other"] as const;

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      studentId,
      schoolId,
      type,
      otherTypeText,   // when type === "Other"
      message,         // optional per UI
      topic,
      userLabel,       // pretty label: "Name | Class | Student"
    } = body || {};

    if (!studentId || !schoolId || !type) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
    }
    if (type === "Other" && !otherTypeText?.trim()) {
      return NextResponse.json({ success: false, error: "Please provide details for 'Other'." }, { status: 400 });
    }

    // normalize values
    const cleanMessage =
      (message?.toString() ?? "").slice(0, 1000); // cap length; UI note is optional
    const storedType = type === "Other" ? `Other: ${otherTypeText.slice(0, 100)}` : type;

    const issue = await Issue.create({
      user: userLabel || studentId, // display label
      school: schoolId,
      type: storedType,
      message: cleanMessage || "No additional notes",
      topic: topic || "",
      studentId: studentId
    });

    return NextResponse.json({ success: true, data: issue }, { status: 201 });
  } catch (err) {
    console.error("POST /api/issues error", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const schoolId = searchParams.get("schoolId");
    const status = searchParams.get("status");

    const q: Record<string, any> = {};
    if (studentId) q.user = studentId; // if user stores the id/label; see note below
    if (schoolId) q.school = schoolId;
    if (status) q.status = status;

    const issues = await Issue.find(q).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: issues });
  } catch (err) {
    console.error("GET /api/issues error", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}