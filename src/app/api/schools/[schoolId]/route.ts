import School from "@/models/School";
import { connectDB } from "@/utils/db";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        await connectDB();

        const { schoolId } = await params;
        const schoolObjectId = new mongoose.Types.ObjectId(schoolId);

        const schoolProfile = await School.findById(schoolObjectId).select("-password -createdAt").lean();

        if (!schoolProfile) {
            return NextResponse.json({ error: "School not found" }, { status: 404 });
        }

        return NextResponse.json(schoolProfile, { status: 200 });
    } catch (error) {
        console.error("Error getting school profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
