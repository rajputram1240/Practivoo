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
    const level = searchParams.get("level") || null;
    const selectedTaskId = searchParams.get("selectedTaskId") || null;

    const { schoolId } = await params;
    console.log(level, schoolId, selectedTaskId);

    // Validate schoolId
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return NextResponse.json({ success: false, error: "Invalid school ID" }, { status: 400 });
    }
    const schoolObjectId = new mongoose.Types.ObjectId(schoolId);

    // Validate selectedTaskId
    if (selectedTaskId && !mongoose.Types.ObjectId.isValid(selectedTaskId)) {
      return NextResponse.json({ success: false, error: "Invalid task ID" }, { status: 400 });
    }

    const students = await Student.find({ school: schoolObjectId, level }).select('_id name image');
    const totalStudents = students.length;

    // Get student IDs for the query
    const studentIds = students.map(s => s._id);
    console.log("studentIds :", studentIds);

    // Get task details to calculate total questions
    const taskDetails = await Task.findById(selectedTaskId).select('questions');
    const totalQuestions = taskDetails ? taskDetails.questions.length : 0;
    console.log(taskDetails)
    // Query only completed task results
    const results = await TaskResult.find({
      student: { $in: studentIds },
      task: selectedTaskId,
      evaluationStatus: 'completed'  // Only get completed evaluations
    })
      .populate({ path: "student", select: "_id name image" })
      .populate({ path: "task", select: "-term -week" })
      .populate({
        path: "answers.question",
        model: Question,
        select: "question heading questiontype media explanation matchThePairs options correctAnswer",
      })
      .sort({ createdAt: -1 });

    console.log("Completed results:", results);

    // Get all results (including pending) for submission tracking
    const allResults = await TaskResult.find({
      student: { $in: studentIds },
      task: selectedTaskId
    })
      .populate({ path: "student", select: "_id name image" })
      .populate({
        path: "answers.question",
        model: Question,
        select: "question heading questiontype media explanation matchThePairs options correctAnswer",
      })
      .sort({ createdAt: -1 });
    console.log("all results:", results);

    // Get IDs of students who have submitted (any status)
    const studentsWithSubmissionIds = allResults.map(r => r.student._id.toString());

    // Create submitted students array with task results included
    const submittedStudents = allResults.map(result => ({
      _id: result.student._id,
      name: result.student.name,
      image: result.student.image,
      taskResult: {
        _id: result._id,
        answers: result.answers,
        task: result.task,
        score: result.score,
        evaluationStatus: result.evaluationStatus,
        createdAt: result.createdAt,
      }
    }));

    // Create not submitted students array (students without results)
    const notSubmittedStudents = students.filter(student =>
      !studentsWithSubmissionIds.includes(student._id.toString())
    ).map(student => ({
      _id: student._id,
      name: student.name,
      image: student.image
    }));

    // Create the submission object structure
    const submission = {
      submitted: submittedStudents,
      notSubmitted: notSubmittedStudents
    };

    // Calculate metrics based on ONLY completed submissions
    const completedSubmissions = results; // Only completed results
    let minScore = completedSubmissions.length > 0 ? completedSubmissions[0].score : 0;
    let maxScore = completedSubmissions.length > 0 ? completedSubmissions[0].score : 0;
    let totalScore = 0;
    const incorrectQuestionCounts = new Map<string, { questionText: string; count: number }>();
    let totalIncorrectAnswers = 0;
    let totalAnswersSubmitted = 0;

    for (const submission of completedSubmissions) {
      totalScore += submission.score;
      minScore = Math.min(minScore, submission.score);
      maxScore = Math.max(maxScore, submission.score);

      if (submission.answers) {
        totalAnswersSubmitted += submission.answers.length;
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

    const avgScore = completedSubmissions.length > 0 ? totalScore / completedSubmissions.length : 0;
    const sortedMistakes = Array.from(incorrectQuestionCounts.values()).sort((a, b) => b.count - a.count);
    const commonMistakes = sortedMistakes.slice(0, 3).map((m) => ({ question: m.questionText, count: m.count }));

    // Count pending submissions
    const pendingSubmissions = allResults.filter(r => r.evaluationStatus === 'pending').length;

    // Dashboard data to return
    const dashboardData = {
      submission: submission,
      metrics: {
        avgScore: totalQuestions > 0 ? `${Math.round(avgScore)}/${totalQuestions}` : Math.round(avgScore),
        maxScore: totalQuestions > 0 ? `${Math.round(maxScore)}/${totalQuestions}` : Math.round(maxScore),
        minScore: totalQuestions > 0 ? `${Math.round(minScore)}/${totalQuestions}` : Math.round(minScore),
        totalSubmissions: `${allResults.length}/${totalStudents}`,
        completedSubmissions: `${completedSubmissions.length}/${totalStudents}`,
        pendingSubmissions: `${pendingSubmissions}/${totalStudents}`,
        commonMistakes: commonMistakes,
        accuracyRate: totalAnswersSubmitted > 0 ? `${Math.round(((totalAnswersSubmitted - totalIncorrectAnswers) / totalAnswersSubmitted) * 100)}%` : '0%',
      },
    };

    // Return response
    return NextResponse.json({ success: true, data: dashboardData }, { status: 200 });
  } catch (error) {
    console.error("Tasks dashboard API error:", error);
    return NextResponse.json({ success: false, error: "Internal server error", message: (error as Error).message }, { status: 500 });
  }
}