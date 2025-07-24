// app/api/admin/notifications/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    notifications: [
      {
        id: 1,
        title: "New Feedback Received",
        subtitle: "Audio is not working",
        user: "Gabby",
        role: "Class A2 | Student",
        school: "XYZ International School",
        type: "Instruction/Text",
        message: "Question 2 says 'enviroment' instead of 'environment'.",
        topic: "Grammar Basics | Term 2",
        date: "July 9, 2025",
      },
      {
        id: 2,
        title: "New issue reported",
        subtitle: "Irrelevant Picture",
        user: "Admin",
        role: "Teacher",
        school: "ABC School",
        type: "Visual/Content",
        message: "Picture used in Term 1 Grammar is not relevant.",
        topic: "Grammar Basics | Term 1",
        date: "June 22, 2025",
      },
    ],
  });
}