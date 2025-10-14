"use client";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { BiLeftArrow, BiLeftArrowCircle } from "react-icons/bi";
import { toast } from "react-toastify";

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

// Updated interface to match API response structure
interface TaskResponse {
    _id: string;
    task: Task;
    level?: string; // level might be at the top level
}

interface RemoveTaskPanelProps {
    Levellist: Level[];
    setremovetask: React.Dispatch<React.SetStateAction<boolean>>;
    setisremoved: React.Dispatch<React.SetStateAction<boolean>>;
}

// Question Viewer Modal Component
const QuestionViewerModal: React.FC<{
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
                <div className="flex items-center">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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


            {/* Navigation Footer */}
            <div className="flex items-center gap-5 justify-center py-4 flex-shrink-0">
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
            <div className="flex-1 overflow-y-auto">
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
                            {/* Conditional rendering based on question type */}
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
                                    <p className="font-bold mt-2">*Note- </p>
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

const RemoveTaskPanel: React.FC<RemoveTaskPanelProps> = ({ setisremoved, setremovetask, Levellist }) => {
    const [allTasks, setAllTasks] = useState<TaskResponse[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<string>("");  // Empty string shows all by default
    const [assignTask, setAssignTask] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [schoolId, setSchoolId] = useState<string>("");

    useEffect(() => {
        const fetchadminAssigntask = async () => {
            let schoolId = JSON.parse(localStorage.getItem("school") || "")._id || ""
            setSchoolId(schoolId);
            console.log(schoolId);
            try {
                const res = await fetch(`/api/schools/${schoolId}/remove-task`);
                const assignedTask = await res.json();
                console.log(assignedTask.tasks)
                /*    const taskdata = await fetch(`/api/admin/tasks`);
                  const alltask = await taskdata.json();
  
                  const filtered = alltask.tasks.filter((task: any) =>
                      task.status !== "Drafts" && (task.term == null && task.week == null)
                  );
  
                  console.log(filtered);  */
                setAllTasks(assignedTask.tasks);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };
        fetchadminAssigntask();
    }, []);

    // This filters tasks based on selected level
    const filteredTasks = useMemo(() => {
        if (!selectedLevel || selectedLevel === "") {
            // Only return tasks where task is not null
            return allTasks.filter(item => item.task !== null);
        }
        console.log(selectedLevel);
        // Filter by level and exclude null tasks
        return allTasks.filter(task => task.task && task.task.level === selectedLevel);
    }, [allTasks, selectedLevel]);

    const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLevel = e.target.value;
        console.log("Level changed to:", newLevel);
        setSelectedLevel(newLevel);
        setAssignTask([]);  // Clear selections when changing level
    };

    const handleTaskSelect = (taskId: string) => {
        setAssignTask((prev) =>
            prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
        );
    };
    const handleViewQuestions = async (taskItem: TaskResponse) => {
        try {
            console.log("Selected task item:", taskItem);
            const task = taskItem.task || taskItem;

            if (!task.questions || task.questions.length === 0) {
                const response = await fetch(`/api/admin/tasks/${task._id}`);
                const taskDetails = await response.json();
                setSelectedTask(taskDetails.task);
            } else {
                setSelectedTask(task as Task);
            }
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching task details:", error);
            alert("Failed to load questions");
        }
    };

    const handleunAssign = async () => {
        try {
            let schoolId = JSON.parse(localStorage.getItem("school") || "")._id || ""
            setSchoolId(schoolId);
            console.log(schoolId);



            const response = await fetch(`/api/schools/${schoolId}/remove-task`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskIds: assignTask,
                }),
            });

            const res = await response.json();
            console.log("Remove response:", res.message);
            if (!response.ok) {
                toast.error(res.message)
                return
            }
            // Refresh the tasks after successful removal
            const updatedTasks = allTasks.filter(taskItem => !assignTask.includes(taskItem._id));
            setAllTasks(updatedTasks);
            setAssignTask([]);
            toast.success(res.message)
            setisremoved(true)

        } catch (err) {
            console.error("Error removing task:", err);
            alert("Failed to remove tasks. Please try again.");
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
                <div className=" h-full flex flex-col">
                    <div className="flex gap-3">
                        <BiLeftArrowCircle
                            className="hover:bg-blue-300 rounded-full cursor-pointer"
                            onClick={() => setremovetask(false)}
                            size={25}
                        />
                        <h2 className="text-xl font-semibold  text-gray-800 mb-6">Remove Tasks</h2>
                    </div>
                    <div className="">
                        <h3 className="mb-2">Search Task</h3>
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



                    <div className="flex-1">
                        <div className="space-y-3 h-60 overflow-y-auto mb-6">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((taskItem) => {
                                    const task = taskItem.task || taskItem;
                                    return (
                                        <div className="flex gap-4 items-center" key={taskItem._id}>
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                onChange={() => handleTaskSelect(taskItem._id)}
                                                checked={assignTask.includes(taskItem._id)}
                                            />
                                            <div className="flex w-fit px-5 py-2 items-center justify-between rounded-full gap-3 bg-[#EEF3FF] border border-blue-100">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-800">{task.topic}</span>
                                                    <span className="whitespace-nowrap text-black">
                                                        ({task.questions?.length || 0} Ques.)
                                                    </span>
                                                    <button
                                                        onClick={() => handleViewQuestions(taskItem)}
                                                        className="border rounded-2xl  px-2 py-1 hover:bg-blue-200 transition-colors"
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
                                    {selectedLevel
                                        ? `No tasks found for the selected level (${Levellist.find(lvl => lvl.code === selectedLevel)?.name || selectedLevel})`
                                        : 'Please select a level to view tasks'
                                    }
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between gap-5 items-center mb-4">
                            <button
                                onClick={() => setremovetask(false)}
                                className="px-6 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleunAssign}
                                disabled={assignTask.length === 0}
                                className="px-6 py-3 bg-red-600 text-white  whitespace-nowrap rounded-full hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Remove Task{assignTask.length > 1 ? "s" : ""} ({assignTask.length})
                            </button>
                        </div>

                        <div className="text-sm text-black">
                            <span className="font-bold">Tasks will be removed from: </span>
                            {selectedLevel ?
                                Levellist.find(lvl => lvl.code === selectedLevel)?.name || selectedLevel
                                : 'No level selected'
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RemoveTaskPanel;