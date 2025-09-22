// app/api/auth/verify-otp/route.ts (FIXED)
import { connectDB } from "@/utils/db";
import { verifyOTP } from "@/utils/otpService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { email, otp, userType } = body;

        if (!email || !otp || !userType) {
            return NextResponse.json({
                success: false,
                message: 'Email, OTP and user type are required'
            }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid email format'
            }, { status: 400 });
        }

        // Validate OTP format (4 digits)
        if (!/^\d{4}$/.test(otp)) {
            return NextResponse.json({
                success: false,
                message: 'OTP must be 4 digits'
            }, { status: 400 });
        }

        // Verify OTP
        const verification = await verifyOTP(email, otp, userType);

        if (!verification.isValid) {
            return NextResponse.json({
                success: false,
                message: 'Invalid or expired OTP'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: 'OTP verified successfully',
            userId: verification.userId // Include userId for next step
        }, { status: 200 });

    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error during OTP verification'
        }, { status: 500 });
    }
}
