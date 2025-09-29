import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { BiLeftArrowCircle } from "react-icons/bi";
import { QuestionViewerModal } from "./AddTaskPanel";
import { SubmissionAnswers } from "./SubmissionAnswers";


// Submission Viewer Component
interface SubmissionViewerProps {
  isOpen: boolean;
  onClose: () => void;
  submission: any;
  task: any;
}

const SubmissionViewer = ({ isOpen, onClose, submission, task }: SubmissionViewerProps) => {
  if (!isOpen || !submission) return null;

  const [viewSubmissionAnswers, setViewSubmissionAnswers] = useState(false);

  const correctAnswers = submission.answers?.filter((answer: any) => answer.isCorrect).length || 0;
  const wrongAnswers = submission.totalQuestions - correctAnswers;
  const questions = task?.questions || [];

  return (


    <div className="bg-white rounded-lg">

      {
        viewSubmissionAnswers ?

          <SubmissionAnswers
            isOpen={viewSubmissionAnswers}
            onClose={() => setViewSubmissionAnswers(false)}
            task={submission}
          />
          : <>
            {/* Header with back arrow and title */}
            <div className="flex items-center gap-3 p-4 ">
              <button
                onClick={onClose}
                className="p-1 hover:bg-blue-100 rounded-full transition-colors"
              >

                <BiLeftArrowCircle size={25} />


              </button>
              <h2 className="text-lg font-semibold text-gray-800">{submission?.student?.name}'s Submission</h2>
            </div>

            {/* Score Overview Card */}
            <div className="p-4 bg-blue-50  rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={submission?.student?.image || "/avatar2.png"}
                  alt={submission?.student?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-800">{submission?.student?.name}'s Submission</h3>
                </div>
              </div>

              {/* Circular Progress and Stats */}
              <div className="flex items-center justify-between rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-4">
                  {/* Circular Progress */}
                  <div className="relative">
                    <svg className="w-30 h-30 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="#3b82f6"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(correctAnswers / submission.totalQuestions) * 220} 220`}
                        className="transition-all duration-300 ease-in-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-xs text-blue-600 font-bold leading-tight">
                      <span className="text-xs text-gray-500">Total Score</span>
                      <span className="text-lg font-bold">{submission.score || correctAnswers}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-gray-800 rounded-full"></span>
                      <span className="text-gray-600">Correct Answers</span>
                      <span className="font-bold text-gray-800">{correctAnswers}/{submission.totalQuestions}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                      <span className="text-gray-600">Wrong Answers</span>
                      <span className="font-bold text-gray-800">{wrongAnswers}/{submission.totalQuestions}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="flex items-center justify-center text-center p-5">

              <button onClick={() => {
                console.log(submission.answers);
                setViewSubmissionAnswers(true)
              }} className="px-3 py-1  hover:bg-gray-200  cursor-pointer text-xs border text-blue-600 border-blue-700 rounded-md 0 transition-colors">
                View Submission Answers
              </button>
            </div>
          </>
      }

    </div>
  );
};


interface TaskStatsPanelProps {
  selectedtask: any; // Replace 'any' with a more specific type if available
  taskResult: any;   // Replace 'any' with a more specific type if available
}

export function TaskStatsPanel({ selectedtask, taskResult }: TaskStatsPanelProps) {
  const [viewSubmission, setViewSubmission] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<{
    _id: any;
    student: any;
    score: any;
    totalQuestions: any;
    answers: any;
  } | null>(null);

  if (!selectedtask) return null;

  useEffect(() => {
    console.log("Selected task in TaskStatsPanel:", selectedtask);
  }, [selectedtask]);

  const totalQuestions = selectedtask?.
    totalquestions
    ?? 0;
  const avgScore = taskResult?.metrics?.avgScore ?? "-";
  const minScore = taskResult?.metrics?.minScore ?? "-";
  const totalSubmissions = taskResult?.metrics?.totalSubmissions ?? "-";
  const commonMistakes = taskResult?.metrics?.commonMistakes ?? "-";

  const handleViewSubmission = (submissionData: any) => {
    // Create submission object with required format
    const submission = {
      _id: submissionData._id,
      student: submissionData.student,
      score: submissionData.score || 0,
      totalQuestions: totalQuestions,
      answers: submissionData.answers || []
    };
    console.log(submission.answers)
    setSelectedSubmission(submission);
    setViewSubmission(true);
  };

  return (
    <>
      {/* Header */}
      {viewSubmission ?
        < SubmissionViewer
          isOpen={viewSubmission}
          onClose={() => {
            setViewSubmission(false);
            setSelectedSubmission(null);
          }}
          submission={selectedSubmission}
          task={selectedtask}
        /> :
        <>

          <div className="flex justify-between items-center bg-[#EDF1FF] p-3 rounded-xl">
            <h3 className="font-bold text-sm text-[#2C2F5A]">
              {selectedtask?.topic}
              <span className="text-xs font-normal text-gray-500"> ({totalQuestions} Questions)</span>
            </h3>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 px-1 text-sm font-medium text-[#2C2F5A]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-full" />
              Avg. Score <span className="font-bold ml-1">{avgScore}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-300 rounded-full" />
              Min. Score <span className="font-bold ml-1">{minScore}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-full" />
              Total Submissions <span className="font-bold ml-1">{totalSubmissions}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-full" />
              Common Mistakes <span className="font-bold ml-1">{commonMistakes}</span>
            </div>
          </div>

          {/* Submissions Header */}
          <div className="flex justify-between items-center mt-2">
            <h4 className="text-sm font-bold text-[#2C2F5A]">Submissions</h4>
          </div>

          {/* Submissions List */}
          <div className="flex flex-col gap-3 pb-2 max-h-[300px] overflow-y-auto">
            {taskResult?.detailedResults && taskResult.detailedResults.length > 0 ? (
              taskResult.detailedResults.map((sub: any) => {
                const hasSubmission = sub.hasSubmission;
                return (
                  <div
                    key={sub._id}
                    className={`flex items-center justify-between px-3 py-2 rounded-full ${hasSubmission ? "bg-[#EDF1FF]" : "bg-[#F2F2F2]"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={sub.student?.image ?? "/avatar2.png"}
                        alt={sub.student?.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium text-[#2C2F5A]">
                        {sub.student?.name} - ({sub.score ?? "-"})
                      </span>
                    </div>
                    <button
                      onClick={() => hasSubmission && handleViewSubmission(sub)}
                      className={`text-xs font-semibold px-3 py-1 rounded-full border transition ${hasSubmission
                        ? "text-[#0047FF] border-[#0047FF] bg-white hover:bg-[#EAF0FF] cursor-pointer"
                        : "text-gray-500 border-gray-300 bg-white cursor-not-allowed"
                        }`}
                      disabled={!hasSubmission}
                    >
                      {hasSubmission ? "View Submission" : "No Submission"}
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500">No submissions found</p>
            )}
          </div>

        </>

      }

    </>
  );
}