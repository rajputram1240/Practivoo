"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"; 


export default function CreateTaskPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [postQuizFeedback, setPostQuizFeedback] = useState(false);

  const [levels, setLevels] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchLevels();
    fetchCategories();
  }, []);

  const fetchLevels = async () => {
    const res = await fetch("/api/admin/levels");
    const json = await res.json();
    console.log(json.levels);
    setLevels(json.levels);
  };

  const fetchCategories = async () => {
    const res = await fetch("/api/admin/categories");
    const json = await res.json();
    if (json.success) setCategories(json.data);
  };

  const handleNext = async () => {
    const res = await fetch("/api/admin/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, level, category, postQuizFeedback }),
    });

    const json = await res.json();
    if (json.success) {
       toast.success("Task created successfully");
       router.push('/admin/tasks')
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">📝 Create New Task</h2>

      {/* Topic Input */}
      <input
        className="border p-2 rounded w-full"
        placeholder="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      {/* Level Dropdown */}
      <select
        className="border p-2 rounded w-full"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
      >
        <option value="">Select Level</option>
        {levels.map((lvl: any) => (
          <option key={lvl._id} value={lvl.code}>
            {lvl.defaultName}
          </option>
        ))}
      </select>

      {/* Category Dropdown */}
      <select
        className="border p-2 rounded w-full"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Select Category</option>
        {categories.map((cat: any) => (
          <option key={cat._id} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </div>
  );
}