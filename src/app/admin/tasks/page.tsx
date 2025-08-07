'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify"; 

type Question = {
  _id: string;
  heading?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  media?: {
    image?: string;
    audio?: string;
  };
  type?: 'single' | 'multi';
};

type Task = {
  _id: string;
  topic: string;
  level: string;
  category: string;
  status: 'Assigned' | 'Drafts';
  questions: Question[];
  term: number;
  week: number;
  createdAt: string;
};

type Level = {
  _id: string;
  code: string;
  defaultName: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksflag, setTasksflag] = useState(0);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [levels, setLevels] = useState<Level[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string>('All')
  const [showEditModal, setShowEditModal] = useState(false);
const [editTaskTopic, setEditTaskTopic] = useState('');
const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
const router = useRouter();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tasksRes, levelsRes] = await Promise.all([
          fetch('/api/admin/tasks'),
          fetch('/api/admin/levels')
        ])

        const tasksData = await tasksRes.json()
        const levelsData = await levelsRes.json()

        setTasks(tasksData.tasks || [])
        setLevels(levelsData.levels || [])
      } catch (err) {
        console.error('Failed to fetch tasks/levels:', err)
      }
    }
    fetchAll()
  }, [tasksflag])

  useEffect(() => {
    if (selectedLevel === 'All') {
      setFilteredTasks(tasks)
    } else {
      setFilteredTasks(tasks.filter(task => task.level === selectedLevel))
    }
    setSelectedTask(null);
  }, [selectedLevel, tasks])

  const handleEditClick = (task: Task) => {
  setEditTaskTopic(task.topic);
  setEditingTaskId(task._id);
  setShowEditModal(true);
};

const handleUpdateTask = async () => {
  if (!editingTaskId) return;

  const res = await fetch(`/api/admin/tasks/${editingTaskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: editTaskTopic }),
  });

  if (res.ok) {
    const updated = await res.json();
    toast.success("Task updated successfully");
    setTasksflag(prev => prev + 1);
    setShowEditModal(false);
  }
};

const handleDeleteTask = async (taskId: string) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this task?");
  if (!confirmDelete) return;

  const res = await fetch(`/api/admin/tasks/${taskId}`, { method: 'DELETE' });
  const result = await res.json();

  if (res.ok) {
    toast.success("Task deleted successfully");
    setTasksflag(prev => prev + 1);
    setSelectedTask(null);
  } else {
    alert(result.message || "Could not delete task.");
  }
};

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="w-2/3 p-4 bg-[#e9efff]">
        <div className="flex items-center justify-between mb-4">
  <h2 className="text-xl font-bold">All Tasks ({filteredTasks.length})</h2>
  <button
    onClick={() => router.push('/admin/tasks/create')}
    className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700"
  >
    + Create Task
  </button>
</div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">All Tasks ({filteredTasks.length})</h2>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            className={`rounded-full border px-3 py-1 text-sm ${selectedLevel === 'All' ? 'bg-blue-200' : ''}`}
            onClick={() => setSelectedLevel('All')}
          >
            All
          </button>
          {levels.map((level) => (
            <button
              key={level._id}
              className={`rounded-full border px-3 py-1 text-sm ${selectedLevel === level.code ? 'bg-blue-200' : ''}`}
              onClick={() => setSelectedLevel(level.code)}
            >
              {level.defaultName}
            </button>
          ))}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-4 font-bold mb-2 text-sm">
          <span>Topic</span>
          <span>Category</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {/* Table Rows */}
        {filteredTasks.map(task => (
          <div
            key={task._id}
            className="grid grid-cols-4 py-2 items-center hover:bg-white cursor-pointer text-sm border-b"
            onClick={() => setSelectedTask(task)}
          >
            <span>{task.topic}</span>
            <span>{task.category}</span>
            <span>
              <button
  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 shadow-sm border ${
    task.status === 'Assigned'
      ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
      : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
  }`}
  onClick={async (e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/tasks/${task._id}`, {
        method: 'PATCH',
      });
      if (res.ok) {
        toast.success("Status updated successfully");
        setTasksflag(prev => prev + 1);
      } else {
        toast.error("Task is in use and its status cannot be changed.");
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  }}
>
  {task.status}
</button>
            </span>
            <span className="space-x-2">
  <button title="Edit" onClick={(e) => { e.stopPropagation(); handleEditClick(task); }}>✏️</button>
  <button title="Delete" onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}>🗑️</button>
</span>
          </div>
        ))}
      </div>

      {/* Right Panel */}
      <div className="w-1/3 p-4 bg-white border-l overflow-y-auto">
        {selectedTask ? (
          <div>
            <h3 className="text-lg font-bold mb-2">Topic: {selectedTask.topic}</h3>
            <p className="text-sm mb-4">{selectedTask.questions.length} Questions</p>

            {selectedTask.questions.map((q, i) => (
              <div key={q._id || i} className="mb-4 border p-3 rounded shadow-sm">
                <p className="font-semibold mb-1">Question {i + 1}:</p>
                {q.heading && <p className="text-sm mb-1 italic">{q.heading}</p>}
                <p className="text-sm mb-2">{q.question}</p>

                {/* Options */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {Array.isArray(q.options) && q.options.map((opt, j) => (
                    <button
                      key={j}
                      className={`border px-2 py-1 rounded text-sm ${opt === q.correctAnswer ? 'bg-green-200' : ''}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {/* Media */}
                {q.media?.image && (
                  <img src={q.media.image} alt="Question image" className="w-full rounded mb-2" />
                )}
                {q.media?.audio && (
                  <audio controls className="w-full mb-2">
                    <source src={q.media.audio} type="audio/mp3" />
                    Your browser does not support audio.
                  </audio>
                )}

                {/* Explanation */}
                <details>
                  <summary className="cursor-pointer text-sm text-blue-500 underline">View Answer</summary>
                  <p className="text-sm mt-1">{q.explanation}</p>
                </details>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-20">No task selected</p>
        )}
      </div>
      
      {showEditModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
      <h2 className="text-lg font-semibold mb-4">Edit Task Topic</h2>
      <input
        value={editTaskTopic}
        onChange={(e) => setEditTaskTopic(e.target.value)}
        className="w-full px-3 py-2 border rounded mb-4"
        placeholder="Enter new task topic"
      />
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setShowEditModal(false)}
          className="px-4 py-2 border rounded text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdateTask}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  )
}