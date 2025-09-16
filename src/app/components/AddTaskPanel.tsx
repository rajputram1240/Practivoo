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
}

// Question Viewer Modal Component
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
                                            <h4 className="font-medium text-gray-700">Columun A (questions):</h4>
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
                                            <h4 className="font-medium text-gray-700">Columun B (options)</h4>
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

            {/* Navigation Footer */}

        </div>
    );
};

// ... rest of AddTaskPanel component remains the same
const AddTaskPanel: React.FC<AddTaskPanelProps> = ({ setaddTask, Levellist }) => {
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [selectedTerm, setSelectedTerm] = useState<number | "">("");
    const [selectedWeek, setSelectedWeek] = useState<number | "">("");
    const [selectedLevel, setSelectedLevel] = useState<string>("");
    const [assignTask, setAssignTask] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    useEffect(() => {
        const fetchadminAssigntask = async () => {
            try {
                const taskdata = await fetch(`/api/admin/tasks`);
                const alltask = await taskdata.json();
                const filtered = alltask.tasks.filter((task: any) => task.status !== "Drafts");
                setAllTasks(filtered);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };
        fetchadminAssigntask();
    }, []);

    const filteredTasks = useMemo(() => {
        if (!selectedLevel) {
            return allTasks;
        }
        return allTasks.filter(task => task.level === selectedLevel);
    }, [allTasks, selectedLevel]);

    const handleTaskSelect = (taskId: string) => {
        setAssignTask((prev) =>
            prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
        );
    };

    const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLevel = e.target.value;
        setSelectedLevel(newLevel);
        setAssignTask([]);
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
            alert("Failed to load questions");
        }
    };

    const handleAssign = async () => {
        try {
            const schoolId = "64ab00000000000000000001";

            if (selectedTerm === "" || selectedWeek === "" || selectedLevel === "") {
                alert("Please select Term, Week, and Level before assigning tasks");
                return;
            }

            const response = await fetch(`/api/schools/${schoolId}/tasks-dashboard/assign-task`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    term: selectedTerm,
                    week: selectedWeek,
                    lvl: selectedLevel,
                    taskIds: assignTask,
                }),
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const res = await response.json();
            console.log("Assign response:", res);

            setAssignTask([]);
            alert("Tasks assigned successfully!");
        } catch (err) {
            console.error("Error assigning task:", err);
            alert("Failed to assign tasks. Please try again.");
        }
    };

    return (
        <div className="">
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
                        <h3 className="mb-2">Select in which class to add Task</h3>
                        <select
                            className="border rounded px-3 py-2 mb-5 w-full max-w-xs"
                            value={selectedLevel}
                            onChange={handleLevelChange}
                        >
                            <option value="">Select Levels</option>
                            {Levellist.map((lvl) => (
                                <option key={lvl.code} value={lvl.code}>
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
                        {selectedLevel && filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <div className=" flex gap-2 items-center" key={task._id}>
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        onChange={() => handleTaskSelect(task._id)}
                                        checked={assignTask.includes(task._id)}
                                    />
                                    <div className="flex px-5 py-1 items-center justify-between rounded-full  gap-3 bg-[#EEF3FF] border border-blue-100">
                                        <div className="flex items-center gap-2 ">
                                            <span className=" font-semibold text-gray-800">{task.topic}</span>
                                            <span className="whitespace-nowrap text-black">({task.questions?.length || 0} Ques.)</span>
                                            {/*     {task.level && (
                                                    <span className="text-xs  px-2 py-1 rounded">
                                                        Level: {Levellist.find(lvl => lvl.code === task.level)?.name || task.level}
                                                    </span>
                                                )} */}
                                            <button
                                                onClick={() => handleViewQuestions(task)}
                                                className="border-blue-400 border text-blue-600 rounded-2xl p-1 cursor-pointer hover:bg-blue-100 transition-colors"
                                            >
                                                View Question
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                {selectedLevel ?
                                    `No tasks found for the selected level` :
                                    `No tasks found Select level`
                                }
                            </div>
                        )}
                    </div>


                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <button className="px-6 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors font-medium">
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
                            Class - {selectedLevel || 'Not Selected'} <br />
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
