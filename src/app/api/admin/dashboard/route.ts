import { NextResponse } from "next/server";

export async function GET() {
  // Example dummy data; replace with DB queries
  return NextResponse.json({
    stats: {
      totalSchools: 126,
      issues: 18,
    },
    tasks: [
      { title: "Topic XYZ (20 Ques.)", type: "Quiz/Test/Assignment" },
      { title: "Topic ABC (15 Ques.)", type: "Assignment" },
    ],
    schools: [
      { name: "XYZ Int. School" },
      { name: "ABC High School" },
    ],
  });
}