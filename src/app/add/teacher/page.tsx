"use client";

import { useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { FiChevronRight } from "react-icons/fi";

const genders = ["Male", "Female", "Other"];
const newTeachers = [
  "Elena Muller",
  "Luca Moretti",
  "Sofia Lindstrom",
  "Pierre Dubois",
];

export default function AddTeacherPage() {
  const [form, setForm] = useState({
    name: "",
    yoe: "",
    gender: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <DashboardLayout>
      <div className="flex p-6 gap-6">
        {/* Left Form Section */}
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800 mb-6">
            Add Teacher
          </h1>

          {/* Name */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-sm"
            />
          </div>

          {/* YOE + Gender */}
          <div className="flex gap-4 mb-4">
            <select
              value={form.yoe}
              onChange={(e) => handleChange("yoe", e.target.value)}
              className="px-4 py-2 border rounded-md text-sm w-full"
            >
              <option disabled value="">
                YOE
              </option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((yoe) => (
                <option key={yoe} value={yoe}>
                  {yoe} years
                </option>
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
              {genders.map((g) => (
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
            Add Teacher
          </button>
        </div>

        {/* Right Panel */}
        <div className="w-[320px] bg-white rounded-xl p-4 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">New Teachers</h2>

          <div className="space-y-2 pt-2">
            {newTeachers.map((teacher) => (
              <div
                key={teacher}
                className="w-full flex items-center justify-between px-4 py-2 border border-black rounded-full text-sm font-medium text-gray-800"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-pink-300" />
                  {teacher}
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