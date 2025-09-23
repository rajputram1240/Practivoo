// app/api/auth/forgot-password/route.ts (FIXED)
import { connectDB } from '@/utils/db';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import School from '@/models/School';
import { createAndSendOTP } from '@/utils/otpService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email, usertype }: { email: string; usertype: string } = await req.json();

        const userType = usertype;

        // Validate input
        if (!email || !userType) {
            return NextResponse.json({
                message: 'Email and user type are required',
                success: false
            }, { status: 400 });
        }

        if (!['school', 'teacher', 'student'].includes(userType)) {
            return NextResponse.json({
                message: 'Invalid user type',
                success: false
            }, { status: 400 }); // Added status code
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                message: 'Invalid email format',
                success: false
            }, { status: 400 }); // Added status code
        }

        let UserModel;
        switch (userType.toLowerCase()) {
            case 'school':
                UserModel = School;
                break;
            case 'teacher':
                UserModel = Teacher;
                break;
            case 'student':
                UserModel = Student;
                break;
            default:
                return NextResponse.json({
                    success: false,
                    message: 'Invalid user type'
                }, { status: 400 });
        }

        // Find user by email - FIXED: Added name field selection
        const user = await UserModel.findOne({ email: email.toLowerCase() }).select("email name");

        if (!user) {
            // Don't reveal if user exists or not for security
            return NextResponse.json({
                message: 'If an account exists, an OTP has been sent to your email',
                success: true
            }, { status: 200 }); // Added status code
        }

        createAndSendOTP(email, user._id, userType, user.name);
        return NextResponse.json({
            message: 'OTP sent to your email address',
            email: email.replace(/(.{2})(.*)(?=.{2})/, '$1***'), // Mask email
            success: true
        }, { status: 200 }); // Added status code

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({
            message: 'Internal server error',
            success: false
        }, { status: 500 }); // Added status code
    }
}
