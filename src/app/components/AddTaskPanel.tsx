"use client";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { BiLeftArrow, BiLeftArrowCircle } from "react-icons/bi";

const STATIC_TERMS = [1, 2, 3, 4];
const STATIC_WEEKS = Array.from({ length: 12 }, (_, i) => i + 1);

interface Level {
    name: string;
    code: string;
}

interface MatchPair {
    key: string;
    value: string;
}

interface Question {
    _id: string;
    heading: string;
    question: string;
    options: string[];
    correctAnswer: string[];
    questiontype: string;
    matchThePairs?: MatchPair[];
    explanation?: string;
    type?: string;
}

interface Task {
    _id: string;
    topic: string;
    level?: string;
    questions?: Question[];
    status: string;
}

interface AddTaskPanelProps {
    Levellist: Level[];
    setaddTask: React.Dispatch<React.SetStateAction<boolean>>;
    setisassigned: React.Dispatch<React.SetStateAction<boolean>>;
}

// Question Viewer Modal Component (unchanged)
export const QuestionViewerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
}> = ({ isOpen, onClose, task }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [viewAnswers, setViewAnswers] = useState(false);

    if (!isOpen || !task) return null;

    const questions = task.questions || [];
    const currentQuestion = questions[currentQuestionIndex];

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between py-4 border-b bg-gray-50 flex-shrink-0">
                <div className="flex items-center ">
                    <button
                        onClick={onClose}
                        className="p-2 hover: rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-semibold">Topic: {task.topic}</h2>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-black text-2xl leading-none"
                >
                    ×
                </button>
            </div>

            {/* Question Progress Indicators */}
            <div className="py-4 flex-shrink-0">
                <div className="flex gap-2 mb-2 flex-wrap">
                    {questions.map((_, index) => (
                        <div
                            key={index}
                            className={`w-4 h-4 border-1 cursor-pointer transition-colors rounded ${index === currentQuestionIndex
                                && 'border-blue-500 bg-blue-500'
                                }`}
                            onClick={() => setCurrentQuestionIndex(index)}
                            style={{ aspectRatio: '1' }}
                        />
                    ))}
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-black">
                        Question {currentQuestionIndex + 1}
                    </span>
                    <span className="text-sm text-black bg-blue-50 px-2 py-1 rounded">
                        Type: {currentQuestion?.questiontype || 'Unknown'}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-center gap-5 n py-4  flex-shrink-0">
                <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 text-black hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>

                <span className="text-sm whitespace-nowrap text-black">
                    {currentQuestionIndex + 1} of {questions.length}
                </span>

                <button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="flex items-center gap-2 px-4 py-2 text-black hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Question Content */}
            <div className="flex-1 ">
                {currentQuestion ? (
                    <>
                        <div className="mb-6 font-bold">
                            {currentQuestion.question && (
                                <p className="text-lg leading-relaxed text-gray-700">
                                    {currentQuestion.question}
                                </p>
                            )}
                        </div>

                        <div className="mb-6">
                            {/* ✅ Conditional rendering based on question type */}
                            {currentQuestion.questiontype === "Match The Pairs" ? (
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Left side - Keys */}
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-700">Column A (questions):</h4>
                                            {currentQuestion.matchThePairs?.map((pair, index) => (
                                                <div
                                                    key={`key-${index}`}
                                                    className="p-3 border-2 border-blue-300 rounded-lg bg-blue-50 font-medium"
                                                >
                                                    {pair.key}
                                                </div>
                                            ))}
                                        </div>
                                        {/* Right side - Values */}
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-700">Column B (options)</h4>
                                            {currentQuestion.matchThePairs?.map((pair, index) => (
                                                <div
                                                    key={`value-${index}`}
                                                    className="p-3 border-2 border-green-300 rounded-lg bg-green-50 font-medium"
                                                >
                                                    {pair.value}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="font-bold mt-2 ">*Note- </p>
                                    <p className="">Question will be shown to students in above order </p>
                                </div>
                            ) : (
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {currentQuestion.options?.map((option, index) => (
                                            <button
                                                key={index}
                                                className="p-2 border-2 border-gray-300 rounded-full text-center font-medium hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Answer Section */}
                        <div className="border-t pt-4">
                            <div className="flex justify-end mb-3">
                                <button
                                    onClick={() => setViewAnswers(!viewAnswers)}
                                    className="text-blue-600 hover:text-blue-700 underline font-medium"
                                >
                                    {viewAnswers ? 'Hide Answer' : 'View Answer'}
                                </button>
                            </div>

                            {viewAnswers && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-green-800 mb-2">Correct Answer(s):</h4>
                                    <div className="space-y-2">
                                        {currentQuestion.correctAnswer?.filter(ans => ans.trim() !== '').map((ans, index) => (
                                            <span
                                                key={index}
                                                className="inline-block bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2"
                                            >
                                                {ans}
                                            </span>
                                        ))}
                                        {(!currentQuestion.correctAnswer || currentQuestion.correctAnswer.every(ans => ans.trim() === '')) && (
                                            <span className="text-gray-500 italic">No answer provided</span>
                                        )}
                                    </div>
                                    {currentQuestion.explanation && (
                                        <div className="mt-3 pt-3 border-t border-green-300">
                                            <h5 className="font-medium text-green-800 mb-1">Explanation:</h5>
                                            <p className="text-green-700">{currentQuestion.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-500 flex-1 flex items-center justify-center">
                        No question available
                    </div>
                )}
            </div>
        </div>
    );
};

// Toast Component for error messages
const Toast: React.FC<{
    message: string;
    type: 'error' | 'success';
    onClose: () => void;
}> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}>
            <div className="flex items-center justify-between">
                <span>{message}</span>
                <button
                    onClick={onClose}
                    className="ml-4 text-white hover:text-gray-200"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

const AddTaskPanel: React.FC<AddTaskPanelProps> = ({ setisassigned, setaddTask, Levellist }) => {
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [selectedTerm, setSelectedTerm] = useState<number | "">("");
    const [selectedWeek, setSelectedWeek] = useState<number | "">("");
    const [selectedLevel, setSelectedLevel] = useState<string>("");
    const [assignTask, setAssignTask] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
    const [schoolId, setSchoolId] = useState<number>(0);

    useEffect(() => {
        let schoolId = JSON.parse(localStorage.getItem("school") || "")._id || ""
        setSchoolId(schoolId);
        console.log(schoolId);

        const fetchadminAssigntask = async () => {
            try {

                const res = await fetch(`/api/schools/${schoolId}/assign-task`);
                const unassignedTask = await res.json();
                console.log(unassignedTask.tasks)
                setAllTasks(unassignedTask.tasks);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };
        fetchadminAssigntask();
    }, [refreshTrigger]);

    const filteredTasks = useMemo(() => {
        if (!selectedLevel || selectedLevel === "") {
            return allTasks;
        }
        return allTasks.filter(task => task.level === selectedLevel);
    }, [allTasks, selectedLevel]);

    // ✅ New function to check if task can be selected
    const canSelectTask = (taskId: string, taskLevel: string | undefined): { canSelect: boolean; errorMessage?: string } => {
        // If a specific level is selected, only allow tasks from that level
        if (selectedLevel && selectedLevel !== "") {
            return { canSelect: true };
        }

        // If "All Levels" is selected, check for level consistency
        if (assignTask.length === 0) {
            return { canSelect: true }; // First task can always be selected
        }

        // Get the levels of already selected tasks
        const selectedTaskLevels = new Set(
            assignTask.map(id => {
                const task = allTasks.find(t => t._id === id);
                return task?.level;
            }).filter(Boolean)
        );

        // If no level is defined for the new task
        if (!taskLevel) {
            if (selectedTaskLevels.size > 0) {
                return {
                    canSelect: false,
                    errorMessage: "Cannot mix tasks without level specification with level-specific tasks"
                };
            }
            return { canSelect: true };
        }

        // If this task has a level, check consistency
        if (selectedTaskLevels.size > 0 && !selectedTaskLevels.has(taskLevel)) {
            const selectedLevelNames = Array.from(selectedTaskLevels).map(level =>
                Levellist.find(lvl => lvl.code === level)?.name || level
            );
            const currentLevelName = Levellist.find(lvl => lvl.code === taskLevel)?.name || taskLevel;

            return {
                canSelect: false,
                errorMessage: `Cannot assign ${currentLevelName} tasks with ${selectedLevelNames.join(', ')} tasks. Please select tasks from the same level only.`
            };
        }

        return { canSelect: true };
    };

    // ✅ Updated handleTaskSelect with validation
    const handleTaskSelect = (taskId: string) => {
        const task = allTasks.find(t => t._id === taskId);

        // If unchecking, always allow
        if (assignTask.includes(taskId)) {
            setAssignTask((prev) => prev.filter((id) => id !== taskId));
            return;
        }

        // If checking, validate level consistency
        const validation = canSelectTask(taskId, task?.level);

        if (!validation.canSelect) {
            setToast({
                message: validation.errorMessage || "Cannot select this task",
                type: 'error'
            });
            return;
        }

        // Add the task if validation passes
        setAssignTask((prev) => [...prev, taskId]);
    };

    const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLevel = e.target.value;
        setSelectedLevel(newLevel);
        setAssignTask([]); // Clear selected tasks when level changes
    };

    const handleViewQuestions = async (task: Task) => {
        try {
            console.log("Selected task:", task);
            if (!task.questions || task.questions.length === 0) {
                const response = await fetch(`/api/admin/tasks/${task._id}`);
                const taskDetails = await response.json();
                setSelectedTask(taskDetails.task);
            } else {
                setSelectedTask(task);
            }
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching task details:", error);
            setToast({
                message: "Failed to load questions",
                type: 'error'
            });
        }
    };

    const handleAssign = async () => {
        try {
            let schoolId = JSON.parse(localStorage.getItem("school") || "")._id || ""
            setSchoolId(schoolId);
            console.log(schoolId);

            if (selectedTerm === "" || selectedWeek === "") {
                setToast({
                    message: "Please select Term, Week, and Level before assigning tasks",
                    type: 'error'
                });
                return;
            }

            console.log(selectedLevel, selectedTerm, selectedWeek);
            const response = await fetch(`/api/schools/${schoolId}/assign-task`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    term: selectedTerm,
                    week: selectedWeek,
                    taskIds: assignTask,
                }),
            });

            const res = await response.json();

            if (!response.ok) {
                setToast({
                    message: res.message || `Request failed with status ${response.status}`,
                    type: 'error'
                });
                return;
            }

            console.log("Assign response:", res);
            setAssignTask([]);
            setToast({
                message: res.message || "Tasks assigned successfully!",
                type: 'success'
            });
            setRefreshTrigger(prev => prev + 1);
            setisassigned(true)
        } catch (err) {
            console.error("Error assigning task:", err);
            setToast({
                message: "Network error. Please check your connection and try again.",
                type: 'error'
            });
        }
    };


    return (
        <div className="">
            {/* Toast notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {isModalOpen ? (
                <QuestionViewerModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    task={selectedTask}
                />
            ) : (
                <div className="h-full flex flex-col">
                    <div className=" flex gap-3">
                        <BiLeftArrowCircle className=" hover:bg-blue-300 rounded-full" onClick={() => setaddTask(false)} size={25} />
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Add Tasks</h2>
                    </div>

                    <div className="">
                        <h3 className="mb-2">Select Task To add</h3>
                        <select
                            className="border rounded px-3 py-2 mb-5 w-full max-w-xs"
                            value={selectedLevel}
                            onChange={handleLevelChange}
                        >
                            <option value="">All Levels</option>
                            {Levellist.map((lvl) => (
                                <option key={lvl.name} value={lvl.name}>
                                    {lvl.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-10">
                        <div className="flex gap-4">
                            <select
                                className="border rounded px-3 py-2"
                                value={selectedTerm}
                                onChange={(e) => setSelectedTerm(e.target.value === "" ? "" : Number(e.target.value))}
                            >
                                <option value="">Select Term</option>
                                {STATIC_TERMS.map((t) => (
                                    <option key={t} value={t}>
                                        Term {t}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="border rounded px-3 py-2"
                                value={selectedWeek}
                                onChange={(e) => setSelectedWeek(e.target.value === "" ? "" : Number(e.target.value))}
                            >
                                <option value="">Select Week</option>
                                {STATIC_WEEKS.map((w) => (
                                    <option key={w} value={w}>
                                        Week {w}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3 h-60 overflow-auto mb-6">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => {
                                const validation = canSelectTask(task._id, task.level);
                                const isDisabled = !validation.canSelect && !assignTask.includes(task._id);

                                return (
                                    <div className=" flex gap-2 items-center" key={task._id}>
                                        <input
                                            type="checkbox"
                                            className={`w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                                }`}
                                            onChange={() => handleTaskSelect(task._id)}
                                            checked={assignTask.includes(task._id)}
                                            disabled={isDisabled}
                                        />
                                        <div className={`flex px-5 py-1 items-center justify-between rounded-full gap-3 bg-[#EEF3FF] border border-blue-100 ${isDisabled ? 'opacity-50' : ''
                                            }`}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-800">{task.topic}</span>
                                                <span className="whitespace-nowrap text-black">({task.questions?.length || 0} Ques.)</span>
                                                {task.level && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        {Levellist.find(lvl => lvl.code === task.level)?.name || task.level}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleViewQuestions(task)}
                                                    className="border-blue-400 border text-blue-600 rounded-2xl p-1 cursor-pointer hover:bg-blue-100 transition-colors"
                                                >
                                                    View Question
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                {allTasks.length === 0
                                    ? "No tasks available"
                                    : selectedLevel
                                        ? `No tasks found for ${Levellist.find(lvl => lvl.code === selectedLevel)?.name || selectedLevel}`
                                        : "No tasks available"
                                }
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <button
                                onClick={() => setaddTask(false)}
                                className="px-6 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={assignTask.length === 0}
                                className="px-6 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors font-medium disabled:opacity-50"
                            >
                                Add Task{assignTask.length > 1 ? "s" : ""} ({assignTask.length})
                            </button>
                        </div>

                        <div className="text-sm text-black">
                            <span className="font-bold">Task will be added to:</span>
                            <br />
                            Class - {selectedLevel ? (Levellist.find(lvl => lvl.code === selectedLevel)?.name || selectedLevel) : 'All Levels'} <br />
                            Term - {selectedTerm || 'Not Selected'} <br />
                            Week - {selectedWeek || 'Not Selected'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddTaskPanel;