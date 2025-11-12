"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import Select from "react-select";
import { toast } from "react-toastify";

export default function AddClassPage() {
  const [className, setClassName] = useState("");
  const [teacherIds, setTeacherIds] = useState<string[]>([]);
  const [levelCode, setLevelCode] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [schoolLevels, setSchoolLevels] = useState<any[]>([]);
  const [newClasses, setNewClasses] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [schoolId, setSchoolId] = useState("");

  const [isNewClass, setIsNewClass] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState("");

  useEffect(() => {
    let schoolId = JSON.parse(localStorage.getItem("school") || "")._id || "";
    setSchoolId(schoolId);

    fetch("/api/teachers")
      .then((res) => res.json())
      .then((data) => setTeachers(data.teachers || []))
      .catch((err) => console.error("Error fetching teachers:", err));

    fetch(`/api/levels?schoolId=${schoolId}`)
      .then((res) => res.json())
      .then((data) => setSchoolLevels(data || []))
      .catch((err) => console.error("Error fetching levels:", err));

    fetchClasses(schoolId);
  }, []);

  const fetchClasses = async (schoolId: string) => {
    try {
      const res = await fetch(`/api/classes?schoolId=${schoolId}`);
      const data = await res.json();
      setNewClasses(data.classes || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const handleAddClass = async () => {
    if (!className || teacherIds.length === 0 || !levelCode) {
      alert("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: className,
          teachers: teacherIds,
          levelCode,
          schoolId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error adding class");
      } else {
        toast.success("Class added successfully!")
        setClassName("");
        setTeacherIds([]);
        setLevelCode("");
        await fetchClasses(schoolId);
      }
    } catch (error) {
      alert("Network error. Please try again.");
      console.error("Error adding class:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacherToExisting = async () => {
    if (!selectedClassId || teacherIds.length === 0) {
      alert("Please select a class and at least one teacher");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/classes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassId,
          teachers: teacherIds,
        }),
      });

      const data = await res.json();
      console.log(data)
      if (!res.ok) {
        alert(data.message || "Error adding teachers to class");
      }
      toast.success(data.message);
      setSelectedClassId("");
      setTeacherIds([]);
      await fetchClasses(schoolId);

    } catch (error) {
      alert("Network error. Please try again.");
      console.error("Error adding teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses =
    selectedFilter === "All"
      ? newClasses
      : newClasses.filter((cls) => cls.level === selectedFilter);

  const teacherOptions = teachers.map((t) => ({
    value: t._id,
    label: t.name,
  }));

  const classOptions = newClasses.map((c) => ({
    value: c._id,
    label: `${c.name} (${c.level})`,
  }));

  const selectedTeacherValues = teacherOptions.filter((t) =>
    teacherIds.includes(t.value)
  );

  return (
    <DashboardLayout>
      <div className="flex p-6 gap-6">
        {/* Left Section */}
        <div className="flex-1">
          {/* Toggle Button */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
            <button
              onClick={() => {
                setIsNewClass(true);
                setTeacherIds([]);
                setSelectedClassId("");
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${isNewClass
                ? "bg-white text-gray-900 shadow"
                : "bg-transparent text-gray-600"
                }`}
            >
              Add New Class
            </button>
            <button
              onClick={() => {
                setIsNewClass(false);
                setTeacherIds([]);
                setClassName("");
                setLevelCode("");
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${!isNewClass
                ? "bg-white text-gray-900 shadow"
                : "bg-transparent text-gray-600"
                }`}
            >
              Add to Existing Class
            </button>
          </div>

          <h1 className="text-xl font-semibold text-gray-800 mb-6">
            {isNewClass ? "Add New Class" : "Add Teachers to Existing Class"}
          </h1>

          {/* Conditional Rendering based on toggle */}
          {isNewClass ? (
            <>
              {/* Add New Class Form */}
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Class Name"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0046D2]"
                />
                <select
                  value={levelCode}
                  onChange={(e) => setLevelCode(e.target.value)}
                  className="px-4 py-2 border rounded-md text-sm w-40 focus:outline-none focus:ring-2 focus:ring-[#0046D2]"
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

              <div className="mb-4">
                <Select
                  options={teacherOptions}
                  onChange={(selected) => {
                    const ids = selected ? selected.map((item) => item.value) : [];
                    setTeacherIds(ids);
                  }}
                  value={selectedTeacherValues}
                  placeholder="Select teachers..."
                  isMulti
                  isClearable
                  closeMenuOnSelect={false}
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>

              <button
                onClick={handleAddClass}
                disabled={loading}
                className="px-6 py-2 bg-[#0046D2] text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#003399] transition-colors"
              >
                {loading ? "Adding..." : "Add Class"}
              </button>
            </>
          ) : (
            <>
              {/* Add Teachers to Existing Class Form */}
              <div className="mb-4">
                <Select
                  options={classOptions}
                  onChange={(selected) => {
                    setSelectedClassId(selected?.value || "");
                    setTeacherIds([]); // Reset teachers when class changes
                  }}
                  value={classOptions.find((c) => c.value === selectedClassId) || null}
                  placeholder="Select existing class..."
                  isClearable
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="mb-4">
                <Select
                  options={teacherOptions}
                  onChange={(selected) => {
                    const ids = selected ? selected.map((item) => item.value) : [];
                    setTeacherIds(ids);
                  }}
                  value={selectedTeacherValues}
                  placeholder="Select teachers to add..."
                  isMulti
                  isClearable
                  closeMenuOnSelect={false}
                  className="text-sm"
                  classNamePrefix="react-select"
                  isDisabled={!selectedClassId}
                />
              </div>

              <button
                onClick={handleAddTeacherToExisting}
                disabled={loading || !selectedClassId}
                className="px-6 py-2 bg-[#0046D2] text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#003399] transition-colors"
              >
                {loading ? "Adding..." : "Add Teachers to Class"}
              </button>
            </>
          )}
        </div>

        {/* Right Section */}
        <div className="w-[320px] bg-white rounded-xl p-4 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800">Classes ({filteredClasses.length})</h2>

          {/* Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFilter("All")}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedFilter === "All"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
            >
              All
            </button>
            {schoolLevels.map((lvl) => (
              <button
                key={lvl._id}
                onClick={() => setSelectedFilter(lvl.customName)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedFilter === lvl.customName
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
              >
                {lvl.customName}
              </button>
            ))}
          </div>

          {/* Class List */}
          <div className="space-y-2 pt-2 max-h-[500px] overflow-y-auto">
            {filteredClasses.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No classes found</p>
            ) : (
              filteredClasses.map((cls) => (
                <div
                  key={cls._id}
                  className="w-full flex justify-between px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-800 hover:border-gray-400 transition-colors"
                >
                  <span className="truncate">{cls.name}</span>
                  <span className="ml-2 text-gray-600">({cls.level})</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}