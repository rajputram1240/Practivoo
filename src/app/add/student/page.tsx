"use client";

import { useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { FiChevronRight } from "react-icons/fi";

const levels = ["All", "Pre A-1", "A1", "A1+", "A2", "A2+", "B1", "B2", "B2+"];
const classOptions = ["Class 1", "Class 2", "Class 3"];
const genderOptions = ["Male", "Female", "Other"];
const newStudents = ["Joy", "Lisa", "Fionna", "Andy"];

export default function AddStudentPage() {
  const [form, setForm] = useState({
    name: "",
    level: "",
    class: "",
    gender: "",
    phone: "",
    email: "",
    password: "",
  });

  const [selectedFilter, setSelectedFilter] = useState("All");

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <DashboardLayout>
      <div className="flex p-6 gap-6">
        {/* Left Form Section */}
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800 mb-6">
            Add Student
          </h1>

          {/* Name and Level */}
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-sm"
            />
            <select
              value={form.level}
              onChange={(e) => handleChange("level", e.target.value)}
              className="px-4 py-2 border rounded-md text-sm w-40"
            >
              <option disabled value="">
                Level
              </option>
              {levels.slice(1).map((lvl) => (
                <option key={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          {/* Class and Gender */}
          <div className="flex gap-4 mb-4">
            <select
              value={form.class}
              onChange={(e) => handleChange("class", e.target.value)}
              className="px-4 py-2 border rounded-md text-sm w-full"
            >
              <option disabled value="">
                Class
              </option>
              {classOptions.map((cls) => (
                <option key={cls}>{cls}</option>
              ))}
            </select>

            <select
              value={form.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="px-4 py-2 border rounded-md text-sm w-full"
            >
              <option disabled value="">
                Gender
              </option>
              {genderOptions.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Phone */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Phone number (Optional)"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-sm"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-sm"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-sm"
            />
          </div>

          {/* Add Another */}
          <div className="mb-4 text-sm text-[#0046D2] cursor-pointer flex items-center gap-2">
            <span className="text-lg">➕</span> Add another
          </div>

          {/* Submit */}
          <button className="px-6 py-2 bg-[#0046D2] text-white rounded-md text-sm">
            Add student
          </button>
        </div>

        {/* Right Panel */}
        <div className="w-[320px] bg-white rounded-xl p-4 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">
            New Students
          </h2>

          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2">
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedFilter(lvl)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  selectedFilter === lvl
                    ? "bg-black text-white"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Student List */}
          <div className="space-y-2 pt-2">
            {newStudents.map((student) => (
              <div
                key={student}
                className="w-full flex items-center justify-between px-4 py-2 border border-black rounded-full text-sm font-medium text-gray-800"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-pink-300" />
                  {student}
                </div>
                <FiChevronRight />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}