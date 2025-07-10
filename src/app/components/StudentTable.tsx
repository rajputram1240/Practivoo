"use client";

import { useState } from "react";

const levelFilters = ["All", "Pre A-1", "A1", "A1+", "A2", "B1", "B2", "B2+", "C1", "C2"];
const studentData = Array(15).fill({
  name: "Joy",
  id: "12345",
  email: "joy@gmail.com",
  gender: "Male",
  avatar: "/avatar1.png",
});

export default function StudentTable() {
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = studentData.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="col-span-8">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <input
          type="text"
          placeholder="Search by student name or email"
          className="w-full px-4 py-2 rounded-md border text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex flex-wrap gap-2 mt-3 text-sm">
          {levelFilters.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1 rounded-full border ${
                selectedLevel === level ? "bg-black text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-y-auto max-h-[450px]">
        <table className="w-full text-sm">
          <thead className="bg-[#F4F6FF] text-left font-semibold">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Student ID</th>
              <th className="p-3">Email</th>
              <th className="p-3">Gender</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student, index) => (
              <tr key={index} className="odd:bg-[#F9FAFF]">
                <td className="p-3 flex items-center gap-2">
                  <img src={student.avatar} alt={student.name} className="w-6 h-6 rounded-full" />
                  {student.name}
                </td>
                <td className="p-3">{student.id}</td>
                <td className="p-3">{student.email}</td>
                <td className="p-3">{student.gender}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}