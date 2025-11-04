"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import Select from "react-select";

export default function AddClassPage() {
  const [className, setClassName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [levelCode, setLevelCode] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [schoolLevels, setSchoolLevels] = useState<any[]>([]);
  const [newClasses, setNewClasses] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const [schoolId, setSchoolId] = useState("");


  useEffect(() => {

    let schoolId = JSON.parse(localStorage.getItem("school") || "")._id || ""
    setSchoolId(schoolId);
    fetch("/api/teachers")
      .then((res) => res.json())
      .then((data) => setTeachers(data.teachers || []));

    fetch(`/api/levels?schoolId=${schoolId}`)
      .then((res) => res.json())
      .then((data) => { console.log(data), setSchoolLevels(data || []) });

    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const res = await fetch("/api/classes");
    const data = await res.json();
    console.log(data.classes)
    setNewClasses(data.classes || []);
  };

  const handleAddClass = async () => {
    if (!className || !teacherId || !levelCode) {
      alert("All fields are required");
      return;
    }


    setLoading(true);
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: className,
        teacher: teacherId, // single value
        levelCode,
        schoolId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Error adding class");
    } else {
      alert("Class added successfully");
      setClassName("");
      setTeacherId("");
      setLevelCode("");
      fetchClasses();
    }

    setLoading(false);
  };

  const filteredClasses =
    selectedFilter === "All"
      ? newClasses
      : newClasses.filter((cls) => cls.level === selectedFilter);

  const teacherOptions = teachers.map((t) => ({
    value: t._id,
    label: t.name,
  }));

  return (
    <DashboardLayout>
      <div className="flex p-6 gap-6">
        {/* Left Section */}
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800 mb-6">Add Class</h1>

          {/* Class Name & Level Select */}
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-sm"
            />
            <select
              value={levelCode}
              onChange={(e) => setLevelCode(e.target.value)}
              className="px-4 py-2 border rounded-md text-sm w-40"
            >
              <option disabled value="">
                Select Level
              </option>
              {schoolLevels.map((lvl) => (
                <option key={lvl._id} value={lvl.customName}>
                  {lvl.customName}
                </option>
              ))}
            </select>
          </div>

          {/* Single Select Teacher with Search (react-select) */}
          <div className="mb-4">
            <Select
              options={teacherOptions}
              onChange={(selected) => setTeacherId(selected?.value || "")}
              value={teacherOptions.find((t) => t.value === teacherId) || null}
              placeholder="Select a teacher..."
              isClearable
              className="text-sm"
              classNamePrefix="react-select"
            />
          </div>

          <button
            onClick={handleAddClass}
            disabled={loading}
            className="px-6 py-2 bg-[#0046D2] text-white rounded-md text-sm"
          >
            {loading ? "Adding..." : "Add Class"}
          </button>
        </div>

        {/* Right Section */}
        <div className="w-[320px] bg-white rounded-xl p-4 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">New Classes</h2>

          {/* Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFilter("All")}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedFilter === "All"
                ? "bg-black text-white"
                : "bg-white text-gray-700 border-gray-300"
                }`}
            >
              All
            </button>
            {schoolLevels.map((lvl) => (
              <button
                key={lvl._id}
                onClick={() => setSelectedFilter(lvl.customName)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedFilter === lvl.customName
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 border-gray-300"
                  }`}
              >
                {lvl.customName}
              </button>
            ))}
          </div>

          {/* Class List */}
          <div className="space-y-2 pt-2">
            {filteredClasses.map((cls) => (
              <div
                key={cls._id}
                className="w-full flex justify-between px-4 py-2 border border-black rounded-full text-sm font-semibold text-gray-800"
              >
                {cls.name}
                <div>
                  ({cls.level})
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}