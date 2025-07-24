// /app/admin/tasks/page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)

  useEffect(() => {
    fetch('/api/admin/tasks')
      .then(res => res.json())
      .then(data => setTasks(data.tasks))
  }, [])

  return (
    <div className="flex">
      {/* Left: Filters and List */}
      <div className="w-2/3 p-4 bg-[#e9efff]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">All Tasks ({tasks.length})</h2>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          {['All', 'Pre A-1', 'A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C1+', 'C2'].map(level => (
            <button key={level} className="rounded-full border px-3 py-1 text-sm">{level}</button>
          ))}
        </div>

        {/* Table */}
        <div className="grid grid-cols-4 font-bold mb-2">
          <span>Topic</span><span>Category</span><span>Status</span><span>Actions</span>
        </div>
        {tasks.map(task => (
          <div key={task._id} className="grid grid-cols-4 py-2 items-center hover:bg-white cursor-pointer" onClick={() => setSelectedTask(task)}>
            <span>{task.topic}</span>
            <span>{task.category}</span>
            <span className={`text-sm ${task.status === 'Assigned' ? 'text-green-600' : 'text-blue-600'}`}>{task.status}</span>
            <span className="space-x-2">
              <button>✏️</button>
              <button>🗑️</button>
            </span>
          </div>
        ))}
      </div>

      {/* Right: Preview Panel */}
      <div className="w-1/3 p-4 bg-white border-l">
        {selectedTask ? (
          <div>
            <h3 className="text-lg font-bold mb-2">Topic {selectedTask.topic}</h3>
            <p className="text-sm mb-2">{selectedTask.questions.length} Ques</p>
            {selectedTask.questions.map((q, i) => (
              <div key={i} className="mb-4 border p-2 rounded">
                <p className="font-medium mb-1">Question {i + 1}</p>
                <p className="text-sm mb-2">{q.question}</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {q.options.map((opt, j) => (
                    <button
                      key={j}
                      className={`border px-2 py-1 rounded ${opt === q.correctAnswer ? 'bg-green-200' : ''}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {q.image && <img src={q.image} alt="q-img" className="w-full mb-2 rounded" />}
                {q.audio && (
                  <audio controls className="w-full">
                    <source src={q.audio} type="audio/mp3" />
                  </audio>
                )}
                <details>
                  <summary className="cursor-pointer text-sm underline">View Answer</summary>
                  <p className="text-sm mt-1">{q.explanation}</p>
                </details>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-20">No task selected</p>
        )}
      </div>
    </div>
  )
}