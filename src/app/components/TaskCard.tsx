"use client";

import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiEye } from "react-icons/fi";

interface Task {
  _id: string;
  topic: string;
  level: string;
  category: string;
  postQuizFeedback?: boolean;
  status: 'Assigned' | 'Drafts';
  questions: any[];
  term?: number;
  week?: number;
  createdAt: string;
  __v: number;
}

interface TaskResult {
  _id: string;
  student: string;
  task: Task | null;
  classId: string;
  answers: {
    question: string;
    selected: string;
    isCorrect: boolean;
    _id: string;
  }[];
  term: number;
  week: number;
  evaluationStatus: "pending" | "completed";
  score: number;
  createdAt: string;
}

interface Props {
  task: TaskResult;
  onClick: (task: TaskResult) => void;
  isSelected: boolean;
}

export default function TaskCard({ task, onClick, isSelected }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Defensive: don't render for missing task
  if (!task || !task.task) return null;
  const t = task.task;

  const questionCount = t.questions?.length || 0;

  // Average score (for display, real value may need calculation)
  // Here, always show task.score (0 for all your examples)
  const averageScore = task.score || 0;

  const submissions = Array.isArray(task.answers) ? task.answers.length : 0;

  // Format date
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string | undefined) => {
    return status === 'Assigned'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  const getCategoryColor = (category: string | undefined) => {
    const categoryColors: Record<string, string> = {
      'Vocabulary': 'bg-blue-100 text-blue-800',
      'Grammar': 'bg-purple-100 text-purple-800',
      'Parts Of Speech': 'bg-green-100 text-green-800',
      'Noun': 'bg-orange-100 text-orange-800',
      'Preposition': 'bg-pink-100 text-pink-800',
      'Verb': 'bg-indigo-100 text-indigo-800',
      'Adjective': 'bg-red-100 text-red-800',
      'Adverb': 'bg-yellow-100 text-yellow-800',
      'Pronoun': 'bg-teal-100 text-teal-800',
      'Reading': 'bg-cyan-100 text-cyan-800',
      'Writing': 'bg-emerald-100 text-emerald-800',
      'Listening': 'bg-violet-100 text-violet-800',
      'Speaking': 'bg-rose-100 text-rose-800',
      'Spelling': 'bg-amber-100 text-amber-800',
      'Comprehension': 'bg-lime-100 text-lime-800',
      'Phonics': 'bg-fuchsia-100 text-fuchsia-800'
    };
    return categoryColors[category || ''] || 'bg-gray-100 text-gray-800';
  };

  // Handle card click to select task
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    onClick(task);
    
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleViewSubmissions = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(task);
  };

  return (
    <div
      className={`rounded-[24px] p-6 bg-white transition-all cursor-pointer hover:shadow-md ${isSelected || expanded
        ? "border-2 border-[#0047FF] shadow-sm"
        : "border border-gray-200"
        }`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-[#2C2F5A]">
              {t.topic || "Unknown Task"}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({questionCount} Ques.)
              </span>
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(t.status)}`}>
              {t.status}
            </span>
            {isSelected && (
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800">
                Selected
              </span>
            )}
          </div>

          {expanded && (
            <>
              <p className="text-base text-gray-400 mt-1">Quiz/Test/Assignment</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-600">Level: <strong>{t.level}</strong></span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(t.category)}`}>
                  {t.category}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-gray-500">
                  Avg. Score - <span className="font-bold text-black">{averageScore}/100</span>
                </p>
                {typeof t.postQuizFeedback !== 'undefined' && (
                  <span className="text-xs text-gray-500">
                    Post-Quiz Feedback: {t.postQuizFeedback ? '✓ Yes' : '✗ No'}
                  </span>
                )}
              </div>
              {(t.term || t.week) && (
                <div className="flex items-center gap-4 mt-1">
                  {typeof t.term !== 'undefined' &&
                    <span className="text-xs text-gray-500">Term: {t.term}</span>
                  }
                  {typeof t.week !== 'undefined' &&
                    <span className="text-xs text-gray-500">Week: {t.week}</span>
                  }
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Created: {formatDate(t.createdAt)}
              </p>
              <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Category:</strong> {t.category}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Click on "View Submissions" to see detailed statistics and student submissions
                </p>
              </div>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FiEye className="text-gray-500 text-sm" />
                  <span className="text-xs text-gray-600">
                    {submissions} submissions
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  Avg: {averageScore}%
                </span>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col items-end justify-between h-full gap-2">
          <button
            onClick={handleExpandToggle}
            className="text-gray-600 text-xl hover:text-gray-800 transition-colors p-1"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          <button
            onClick={handleViewSubmissions}
            className={`text-xs px-5 py-2 rounded-full font-semibold transition-all ${isSelected
              ? 'bg-[#0037cc] text-white'
              : 'bg-[#0047FF] text-white hover:bg-[#0037cc]'
              }`}
          >
            View Submissions
          </button>
        </div>
      </div>
    </div>
  );
}
