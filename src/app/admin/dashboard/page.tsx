"use client";

import { useEffect, useState } from "react";
import { HiArrowNarrowRight } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import { useRouter } from 'next/navigation';

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
  questions: Question[] | string[]; // Sometimes IDs
  term: number;
  week: number;
  createdAt: string;
  title?: string;
  type?: string;
  questionCount?: number;
};

type Level = {
  _id: string;
  code: string;
  defaultName: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalSchools: 0, issues: 0 });
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [schools, setSchools] = useState([]);
  const [activePanel, setActivePanel] = useState<"schools" | "issues">("schools");
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState<Level[]>([]);
  const router = useRouter();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, levelsRes] = await Promise.all([
          fetch("/api/admin/dashboard"),
          fetch("/api/admin/levels"),
        ]);

        const dashboardData = await dashboardRes.json();
        const levelsData = await levelsRes.json();

        const enrichedTasks: Task[] = (dashboardData.recentTasks || []).map((task: Task) => ({
          ...task,
          questionCount: Array.isArray(task.questions) ? task.questions.length : 0,
          title: `${task.topic} (${Array.isArray(task.questions) ? task.questions.length : 0} Ques.)`,
          type: task.status || 'Drafts',
        }));

        setStats(dashboardData.stats);
        setAllTasks(enrichedTasks);
        setFilteredTasks(enrichedTasks);
        setSchools(dashboardData.schools || []);
        setLevels(levelsData.levels || []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter tasks when level changes
  useEffect(() => {
    if (selectedLevel === 'All') {
      setFilteredTasks(allTasks);
    } else {
      setFilteredTasks(allTasks.filter(task => task.level === selectedLevel));
    }
  }, [selectedLevel, allTasks]);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left Main Content */}
      <div className="flex-1">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            onClick={() => setActivePanel("schools")}
            className="bg-white rounded-2xl p-6 shadow text-[#2D3E50] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Total Schools</p>
                <p className="text-3xl font-bold text-[#0046D2]">{stats.totalSchools}</p>
              </div>
              <button className="bg-[#0046D2] text-white w-9 h-9 rounded-full flex items-center justify-center">
                <HiArrowNarrowRight />
              </button>
            </div>
          </div>
          <div
            onClick={() => setActivePanel("issues")}
            className="bg-white rounded-2xl p-6 shadow text-[#2D3E50] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Issues & Feedbacks</p>
                <p className="text-3xl font-bold text-[#0046D2]">{stats.issues}</p>
              </div>
              <button className="bg-white border border-[#0046D2] text-[#0046D2] w-9 h-9 rounded-full flex items-center justify-center">
                <HiArrowNarrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white p-6 rounded-2xl shadow mb-6">
          <h3 className="text-[#2D3E50] font-semibold text-lg mb-4">Tasks Assigned</h3>

          {/* Level Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
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

          {/* Task List */}
          {loading ? (
            <p className="text-sm text-gray-500">Loading tasks...</p>
          ) : filteredTasks.length === 0 ? (
            <p className="text-sm text-gray-500">No tasks found</p>
          ) : (
            filteredTasks.map((task, i) => (
              <div
                key={i}
                className="flex justify-between items-center border border-[#0046D2] rounded-full px-5 py-3 mb-3 hover:shadow-sm"
              >
                <div>
                  <p className="font-bold text-sm text-[#2D3E50]">{task.title}</p>
                  <p className="text-xs text-[#999]">Type - {task.type}</p>
                </div>
                <button onClick={() => router.push('/admin/tasks')} className="text-[#0046D2] border border-[#0046D2] px-4 py-1.5 text-sm rounded-full hover:bg-[#0046D2] hover:text-white transition">
                  View
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-[340px] bg-white p-6 rounded-2xl shadow">
        {activePanel === "schools" ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[#2D3E50] flex items-center gap-2">
                <span role="img">🏫</span> Schools
              </h3>
              <button className="text-[#2D3E50] text-xl">
                <FiSettings />
              </button>
            </div>
            {loading ? (
              <p className="text-sm text-gray-500">Loading schools...</p>
            ) : schools.length === 0 ? (
              <p className="text-sm text-gray-500">No schools found</p>
            ) : (
              schools.map((school: any, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border border-[#D9D9D9] rounded-full px-4 py-3 mb-3 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full" />
                    <span className="text-sm font-medium text-[#2D3E50]">{school.name}</span>
                  </div>
                  <button className="text-[#0046D2] text-xl">→</button>
                </div>
              ))
            )}
          </>
        ) : (
          <>
            <h3 className="font-bold text-lg text-[#2D3E50] mb-4 flex items-center gap-2">
              <span role="img">🧾</span> Issues & Feedback
            </h3>
            <div className="flex gap-4 mb-4">
              <button className="px-4 py-1.5 rounded-full bg-black text-white text-sm">Pending</button>
              <button className="px-4 py-1.5 rounded-full border border-black text-sm">Resolved</button>
            </div>
            <p className="text-sm text-gray-500">Issue system integration coming soon.</p>
          </>
        )}
      </div>
    </div>
  );
}