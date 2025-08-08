'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { Suspense } from "react";

type Question = {
  _id: string;
  heading?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  media?: {
    image?: string;
    audio?: string;
  };
  type?: 'single' | 'multi';
};

type Task = {
  _id: string;
  topic: string;
};

export default function Page() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [taskId, setTaskId] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
 const [page, setPage] = useState(1);
const pageSize = 10;

const startIndex = (page - 1) * pageSize;
const endIndex = startIndex + pageSize;
const paginatedQuestions = questions.slice(startIndex, endIndex);

  const router = useRouter();
  const searchParams = useSearchParams();


  useEffect(() => {
    const fetchAll = async () => {
      const [qRes, tRes] = await Promise.all([
        fetch('/api/admin/questions'),
        fetch('/api/admin/tasks'),
      ]);

      const questionsData = await qRes.json();
      const tasksData = await tRes.json();

      setQuestions(questionsData.questions || []);
      setTasks(tasksData.tasks || []);

      const urlTaskId = searchParams!.get('taskid');
      if (urlTaskId) setTaskId(urlTaskId);
    };

    fetchAll();
  }, []);

  const handleToggleSelect = (id: string) => {
    setSelectedQuestions(prev =>
      prev.includes(id) ? prev.filter(qid => qid !== id) : [...prev, id]
    );
  };

  const handleAssignToTask = async () => {
    if (!taskId || selectedQuestions.length === 0) {
      toast.error('Select at least one question and choose a task.');
      return;
    }

    const res = await fetch(`/api/admin/tasks/${taskId}/assign-questions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionIds: selectedQuestions }),
    });

    if (res.ok) {
      toast.success('Questions assigned to task!');
      setSelectedQuestions([]);
      setTaskId('');
    } else {
      toast.error('Failed to assign questions.');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
  if (!window.confirm('Are you sure you want to delete this question?')) return;

  const res = await fetch(`/api/admin/questions/${id}`, {
    method: 'DELETE',
  });

  if (res.ok) {
    toast.success('Question deleted!');
    setQuestions(prev => prev.filter(q => q._id !== id));
    setSelectedQuestions(prev => prev.filter(qid => qid !== id));
  } else {
    toast.error('Failed to delete question.');
  }
};

  return (
    <Suspense fallback={<div className="p-6">Loading questions...</div>}>
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Questions</h1>
        <button
          onClick={() => router.push('/admin/questions/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          + Create New Question
        </button>
      </div>

      {/* Task Select using react-select */}
<div className="mb-4 max-w-sm">
    <label className="block mb-1 text-sm font-medium text-gray-700">
    Select Task to Assign Questions
  </label>
  <Select
    placeholder="Select a Task..."
    value={tasks.find(task => task._id === taskId) ? {
      value: taskId,
      label: tasks.find(task => task._id === taskId)?.topic || ''
    } : null}
    options={tasks.map(task => ({
      value: task._id,
      label: task.topic
    }))}
    onChange={(selectedOption) => {
      setTaskId(selectedOption?.value || '');
    }}
    isSearchable
  />

  <button
    onClick={handleAssignToTask}
    className="mt-2 bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700"
  >
    Assign Selected Questions
  </button>
</div>

      {/* Selected Count and Pagination Controls */}
<div className="flex justify-between items-center mb-2">
  <span className="text-sm font-medium">
    Selected: {selectedQuestions.length} / {questions.length}
  </span>
  <div className="space-x-2">
    <button
      className="px-2 py-1 border rounded text-sm"
      disabled={page === 1}
      onClick={() => setPage(prev => Math.max(1, prev - 1))}
    >
      Prev
    </button>
    <span className="text-sm">Page {page}</span>
    <button
      className="px-2 py-1 border rounded text-sm"
      disabled={endIndex >= questions.length}
      onClick={() => setPage(prev => prev + 1)}
    >
      Next
    </button>
  </div>
</div>

{/* Data Table */}
<div className="border rounded overflow-hidden">
  <div className="grid grid-cols-12 bg-gray-100 p-2 font-semibold text-sm border-b">
    <div className="col-span-1 text-center">#</div>
    <div className="col-span-1 text-center">✔</div>
    <div className="col-span-5">Heading</div>
    <div className="col-span-5">Question</div>
  </div>

  {paginatedQuestions.map((q, idx) => (
    <div
      key={q._id}
      className="grid grid-cols-12 p-2 border-b items-center text-sm"
    >
      <div className="col-span-1 text-center">{startIndex + idx + 1}</div>
      <div className="col-span-1 text-center">
        <input
          type="checkbox"
          checked={selectedQuestions.includes(q._id)}
          onChange={() => handleToggleSelect(q._id)}
        />
      </div>
      <div className="col-span-5 flex flex-col">
  <span>{q.heading || '—'}</span>
  <div className="mt-1 flex gap-2 text-xs text-blue-600">
    <button
      onClick={() => router.push(`/admin/questions/${q._id}`)}
      className="hover:underline"
    >
      ✏️ Edit
    </button>
    <button
      onClick={() => handleDeleteQuestion(q._id)}
      className="text-red-600 hover:underline"
    >
      🗑 Delete
    </button>
  </div>
</div>
<div className="col-span-5">{q.question}</div>
    </div>
  ))}
</div>
    </div>
    </Suspense>
  );
}