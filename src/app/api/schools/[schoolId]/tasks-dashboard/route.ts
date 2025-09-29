import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/utils/db";
import Student from "@/models/Student";
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";
import Question from "@/models/Question";
import Class from "@/models/Class";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    // Connect to DB
    await connectDB();

    // Extract search parameters
    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term") ? parseInt(searchParams.get("term") as string) : null;
    const week = searchParams.get("week") ? parseInt(searchParams.get("week") as string) : null;
    const level = searchParams.get("level") || null;
    const selectedTaskId = searchParams.get("selectedTaskId") || null;

    const { schoolId } = await params;
    console.log(term, week, level, schoolId, selectedTaskId)
    // Validate schoolId
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return NextResponse.json({ success: false, error: "Invalid school ID" }, { status: 400 });
    }
    const schoolObjectId = new mongoose.Types.ObjectId(schoolId);

    // Validate selectedTaskId
    if (selectedTaskId && !mongoose.Types.ObjectId.isValid(selectedTaskId)) {
      return NextResponse.json({ success: false, error: "Invalid task ID" }, { status: 400 });
    }

    // Get classes for this school (filtered by level if given)
    const classFilter: { school: mongoose.Types.ObjectId; level?: string } = { school: schoolObjectId };
    if (level) classFilter.level = level;
    const schoolClasses = await Class.find(classFilter).select("_id name level");
    const classIds = schoolClasses.map((cls) => cls._id);
    console.log("classids",classIds)
    // Count students in classes
    const totalStudents = await Student.countDocuments({ class: { $in: classIds },level });
    console.log("totalStudents",totalStudents)

    // Get total questions for selected task
    let totalQuestions = 0;
    const task = await Task.findById(selectedTaskId).select("questions");
    if (task && task.questions) totalQuestions = task.questions.length;

    console.log("Total task:", task);
    // Build query for TaskResult
    const query: any = {
      classId: { $in: classIds },
    };
    if (term !== null) query.term = term;
    if (week !== null) query.week = week;
    if (selectedTaskId !== null) query.task = new mongoose.Types.ObjectId(selectedTaskId);

    // Fetch task results with populates
    const results = await TaskResult.find(query)
      .populate({ path: "student", select: "name image" })
      .populate({ path: "task", select: "-term -week" })
      .populate({
        path: "answers.question",
        model: Question,
        select: "question heading questiontype media explanation matchThePairs options correctAnswer",
      })
      .sort({ createdAt: -1 });
    console.log("result", results)

    // Separate completed and pending submissions
    const completedSubmissions = results.filter((r) => r.evaluationStatus === "completed");
    const pendingSubmissions = results.filter((r) => r.evaluationStatus === "pending");

    // Add hasSubmission flag for both completed and pending
    const enrichedResults = results.map((r) => ({
      ...r.toObject(),
      hasSubmission: r.evaluationStatus === "completed" || r.evaluationStatus === "pending",
    }));

    // Calculate metrics based on completed submissions
    let minScore = completedSubmissions.length > 0 ? completedSubmissions[0].score : 0;
    let maxScore = completedSubmissions.length > 0 ? completedSubmissions[0].score : 0;
    let totalScore = 0;
    const incorrectQuestionCounts = new Map<string, { questionText: string; count: number }>();
    let totalIncorrectAnswers = 0;
    let totalAnswersSubmitted = 0; // Initialize a counter for total answers
    for (const submission of completedSubmissions) {
      totalScore += submission.score;
      minScore = Math.min(minScore, submission.score);
      maxScore = Math.max(maxScore, submission.score);

      if (submission.answers) {
        totalAnswersSubmitted += submission.answers.length; // Add the number of answers to the total
        for (const answer of submission.answers) {
          if (!answer.isCorrect && answer.question && answer.question.question) {
            const questionId = answer.question._id.toString();
            const questionText = answer.question.question;
            const current = incorrectQuestionCounts.get(questionId) ?? { questionText, count: 0 };
            current.count += 1;
            incorrectQuestionCounts.set(questionId, current);
            totalIncorrectAnswers++;
          }
        }
      }
    }

    const avgScore = totalScore / (completedSubmissions.length || 1);
    const sortedMistakes = Array.from(incorrectQuestionCounts.values()).sort((a, b) => b.count - a.count);
    const commonMistakes = sortedMistakes.slice(0, 3).map((m) => ({ question: m.questionText, count: m.count }));

    // Dashboard data to return
    const dashboardData = {
      detailedResults: enrichedResults,
      metrics: {
        avgScore: totalQuestions > 0 ? `${Math.round(avgScore)}/${totalQuestions}` : Math.round(avgScore),
        maxScore: totalQuestions > 0 ? `${Math.round(maxScore)}/${totalQuestions}` : Math.round(maxScore),
        minScore: totalQuestions > 0 ? `${Math.round(minScore)}/${totalQuestions}` : Math.round(minScore),
        totalSubmissions: `${completedSubmissions.length}/${totalStudents}`,
        commonMistakes: totalAnswersSubmitted > 0 ? `${totalIncorrectAnswers}/${totalAnswersSubmitted}` : '0/0',
        pendingSubmissions
        // Updated line to use totalAnswersSubmitted
      },
    };

    // Return response
    return NextResponse.json({ success: true, data: dashboardData }, { status: 200 });
  } catch (error) {
    console.error("Tasks dashboard API error:", error);
    return NextResponse.json({ success: false, error: "Internal server error", message: (error as Error).message }, { status: 500 });
  }
}