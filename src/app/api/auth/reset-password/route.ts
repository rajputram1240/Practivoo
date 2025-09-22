// app/api/auth/reset-password/route.ts (IMPROVED)
import School from '@/models/School';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import { connectDB } from '@/utils/db';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import OTP from '@/models/OTP';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { email, newPassword, userType } = body;

        if (!email || !newPassword || !userType) {
            return NextResponse.json({
                success: false,
                message: 'Email, OTP, new password, and user type are required'
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


        // Validate password strength
        if (newPassword.length < 8) {
            return NextResponse.json({
                success: false,
                message: 'Password must be at least 8 characters long'
            }, { status: 400 });
        }

        // Validate userType
        const validUserTypes = ['student', 'teacher', 'school'];
        if (!validUserTypes.includes(userType.toLowerCase())) {
            return NextResponse.json({
                success: false,
                message: 'Invalid user type'
            }, { status: 400 });
        }



        await OTP.deleteOne({ email });

        // Get the appropriate model based on userType
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

        // Find user by email
        const user = await UserModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }

        // Check if new password is different from current password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return NextResponse.json({
                success: false,
                message: 'New password must be different from the current password'
            }, { status: 400 });
        }
        // Update password using save method to trigger pre-save hook
        user.password = newPassword; // Set plain text password
        await user.save(); // This will trigger the pre-save hook to hash it 
        return NextResponse.json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        }, { status: 200 });

    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error during password reset'
        }, { status: 500 });
    }
}
