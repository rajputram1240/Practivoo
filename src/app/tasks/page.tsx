"use client";

import { useEffect, useState } from "react";
import TermTabs from "../components/TermTabs";
import WeekSelector from "../components/WeekSelector";
import TaskTags from "../components/TaskTags";
import TaskCard from "../components/TaskCard";
import DashboardLayout from "../components/DashboardLayout";
import AddTaskPanel from "../components/AddTaskPanel";
import { TaskStatsPanel } from "../components/TaskStatsPanel";
import { Cross, Plus, Trash, Trash2 } from "lucide-react";
import RemoveTaskpanel from "../components/RemoveTaskpanel";

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

export default function TasksPage() {
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>();
  const [selectedTerm, setSelectedTerm] = useState<number | undefined>();
  const [filteredTasks, setFilteredTasks] = useState<TaskResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTask, setSelectedTask] = useState<TaskResult | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [Addtask, setAddtask] = useState(false);
  const [Removetask, setremovetask] = useState(false);
  const [Levellist, setLevelslist] = useState<{ name: string, code: string }[]>([]);
  const [TaskResult, setTaskResult] = useState<TaskResult[]>([]);
  const [submissions, setsubmissions] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  useEffect(() => {
    const fetchTasksResult = async () => {
      setLoading(true);
      try {
        const schoolId = "64ab00000000000000000001";
        const rr = await fetch(`/api/schools/${schoolId}/tasks-dashboard/taskresult`);
        const r = await rr.json();
        const validResults = Array.isArray(r)
          ? r
          : [];
        setTaskResult(validResults);

        console.log(validResults)
        const leveldata = await fetch(`/api/levels?schoolId=${schoolId}`);
        const levelsres = await leveldata.json();
        setLevelslist(levelsres);

        const uniqueCategories = [
          ...new Set(
            validResults
              .map((res) => res.task?.category)
              .filter(Boolean)
          ),
        ];
        setAvailableCategories(uniqueCategories);

        setFilteredTasks(validResults);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setAvailableCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasksResult();
  }, []);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!selectedTask || !selectedTask.task) {
        setsubmissions(null);
        return;
      }
      console.log(selectedTask)
      const schoolId = "64ab00000000000000000001";
      const selectedTaskId = selectedTask.task._id;
      const term = selectedTask.term !== undefined ? String(selectedTask.term) : "";
      const week = selectedTask.week !== undefined ? String(selectedTask.week) : "";
      const level = selectedTask.task.level !== undefined ? String(selectedTask.task.level) : "";
      try {
        const submmisonres = await fetch(
          `/api/schools/${schoolId}/tasks-dashboard?term=${term}&week=${week}&level=${level}&selectedTaskId=${selectedTaskId}`
        );
        const submmisondata = await submmisonres.json();
        setsubmissions(submmisondata.data || null);
        console.log(submmisondata.data)
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setsubmissions(null);
      }
    };
    fetchSubmissions();
  }, [selectedTask]);

  useEffect(() => {
    let filtered: TaskResult[] = TaskResult;

    if (selectedCategory) filtered = filtered.filter((t) => t.task?.category === selectedCategory);
    if (selectedTerm !== undefined) filtered = filtered.filter((t) => t.task?.term === selectedTerm);
    if (selectedWeek !== undefined) filtered = filtered.filter((t) => t.task?.week === selectedWeek);
    if (selectedLevel) filtered = filtered.filter((t) => t.task?.level === selectedLevel);

    const assignedOnly = filtered.filter((t) => t.task?.status !== "Drafts");
    setFilteredTasks(assignedOnly);

    if (selectedTask && !assignedOnly.find((t) => t._id === selectedTask._id)) setSelectedTask(null);
  }, [TaskResult, selectedCategory, selectedTerm, selectedWeek, selectedLevel, selectedTask]);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setSelectedTask(null);
  };

  const handleTaskSelect = (task: TaskResult) => {
    setAddtask(false);
    if (!task || !task.task) return;
    setSelectedTask((prevTask) => (prevTask?._id === task._id ? null : task));
  };

  /*   const terms = [1, 2, 3, 4];
    const weeks = Array.from({ length: 12 }, (_, i) => i + 1); */

  return (
    <DashboardLayout>
      <div className="flex gap-6 px-6 py-6 bg-[#F6F8FF] min-h-screen">
        <div className={`space-y-4 transition-all duration-300 ${selectedTask ? "flex-1" : "w-full"}`}>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#2C2F5A]">Tasks Dashboard</h1>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Levels</option>
              {Levellist.map((lvl) => (
                <option key={lvl.name} value={lvl.code}>
                  {lvl.name}
                </option>
              ))}
            </select>
          </div>

          <TermTabs selectedTerm={selectedTerm} onSelect={setSelectedTerm} />
          <WeekSelector selectedweek={selectedWeek} onSelect={setSelectedWeek} />

          <div className="flex items-center justify-between mt-2">
            <h2 className="text-sm font-semibold text-gray-700">Week-{selectedWeek ?? "All"} Tasks</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddtask(true)}
                className="text-xs px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1"
              >
                <Plus /> Add Tasks
              </button>
              <button onClick={() => {
                setAddtask(false);
                setSelectedTask(null)
                setremovetask(true)
              }} className="text-xs px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1">
                <Trash2 /> Remove Tasks
              </button>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-700">Submission Task Result </h2>

          <TaskTags availableCategories={availableCategories} selectedCategory={selectedCategory} onCategorySelect={handleCategoryFilter} />

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          ) : (
            <div className="space-y-4 pb-6">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onClick={handleTaskSelect} isSelected={selectedTask?._id === task._id} />
                ))
              ) : (
                <p className="flex text-center justify-center items-center">No valid tasks found.</p>
              )}
            </div>
          )}
        </div>

        <div className="w-[500px] bg-white rounded-2xl p-4 flex flex-col gap-4 shadow-sm ">
          {Addtask ? (
            <AddTaskPanel setaddTask={setAddtask} Levellist={Levellist} />
          ) : selectedTask && selectedTask.task ? (
            <TaskStatsPanel selectedtask={selectedTask.task} taskResult={submissions} />
          ) :
            Removetask ? (
              <RemoveTaskpanel setremovetask={setremovetask} Levellist={Levellist} />
            ) :
              (
                <p className="flex text-center justify-center items-center">Select task to view detailed info.</p>
              )}
        </div>
      </div>
    </DashboardLayout>
  );
}