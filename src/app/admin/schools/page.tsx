"use client";

import { useState } from "react";
import {
  FiSearch,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUsers,
  FiUserCheck,
  FiCalendar,
} from "react-icons/fi";

const dummySchools = [
  {
    id: 1,
    name: "XYZ Int. School",
    email: "XYZschool@gmail.com",
    phone: "9082763900",
    country: "India",
    status: "active",
    students: 126,
    teachers: 23,
    startDate: "2025-06-21",
    endDate: "2026-06-21",
    avatar: "/school.jpg",
  },
  {
    id: 2,
    name: "ABC Int. School",
    status: "deactivated",
  },
];

export default function SchoolsPage() {
  const [schools, setSchools] = useState(dummySchools);
  const [selectedSchool, setSelectedSchool] = useState(dummySchools[0]);
  const [search, setSearch] = useState("");
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ ...selectedSchool });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    startDate: "",
    endDate: "",
    country: "India",
  });

  const filteredSchools = schools.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeactivate = () => {
    const updated = schools.map((s) =>
      s.id === selectedSchool.id ? { ...s, status: "deactivated" } : s
    );
    setSchools(updated);
    setSelectedSchool({ ...selectedSchool, status: "deactivated" });
    setShowDeactivateModal(false);
  };

  const handleDelete = () => {
    const updated = schools.filter((s) => s.id !== selectedSchool.id);
    setSchools(updated);
    setSelectedSchool(updated[0] || null);
    setShowDeleteModal(false);
  };

  const handleAddSchool = () => {
    const newEntry = {
      ...newSchool,
      id: Date.now(),
      status: "active",
      students: 0,
      teachers: 0,
      avatar: "/school.jpg",
    };
    setSchools([...schools, newEntry]);
    setShowAddForm(false);
    setNewSchool({
      name: "",
      phone: "",
      email: "",
      password: "",
      startDate: "",
      endDate: "",
      country: "India",
    });
  };

  const handleEditSave = () => {
    const updated = schools.map((s) =>
      s.id === selectedSchool.id ? { ...s, ...editForm } : s
    );
    setSchools(updated);
    setSelectedSchool({ ...selectedSchool, ...editForm });
    setEditMode(false);
  };

  return (
    <div className="flex gap-6 relative">
      {/* Left: School list */}
      <div className="w-2/3 bg-[#F4F6FE] p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">🏫 Schools</h2>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditMode(false);
              setSelectedSchool(null);
            }}
            className="px-4 py-2 bg-white text-[#0046D2] font-medium rounded-full border hover:shadow"
          >
            + Add New School
          </button>
        </div>
        <div className="relative mb-4">
          <FiSearch className="absolute top-3 left-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by school name"
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#2C2F5A]">
              <th className="py-2">Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchools.map((school) => (
              <tr
                key={school.id}
                className={`cursor-pointer hover:bg-white rounded-xl ${
                  selectedSchool?.id === school.id ? "bg-white" : ""
                }`}
                onClick={() => {
                  setSelectedSchool(school);
                  setEditForm(school);
                  setEditMode(false);
                  setShowAddForm(false);
                }}
              >
                <td className="py-2">{school.name}</td>
                <td>
                  <span
                    className={`text-sm font-medium flex items-center gap-1 ${
                      school.status === "active" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {school.status === "active" ? "✅ Active" : "🚫 Disabled"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right Panel */}
      <div className="w-1/3 p-6 bg-white rounded-xl shadow relative overflow-hidden">
        {showAddForm ? (
          <>
            <h3 className="text-xl font-semibold mb-4">Add New School</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="School Name"
                value={newSchool.name}
                onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                className="w-full px-4 py-2 rounded border"
              />
              <input
                type="text"
                placeholder="Phone"
                value={newSchool.phone}
                onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
                className="w-full px-4 py-2 rounded border"
              />
              <input
                type="email"
                placeholder="Email"
                value={newSchool.email}
                onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                className="w-full px-4 py-2 rounded border"
              />
              <input
                type="password"
                placeholder="Password"
                value={newSchool.password}
                onChange={(e) => setNewSchool({ ...newSchool, password: e.target.value })}
                className="w-full px-4 py-2 rounded border"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={newSchool.startDate}
                  onChange={(e) => setNewSchool({ ...newSchool, startDate: e.target.value })}
                  className="w-full px-4 py-2 rounded border"
                />
                <input
                  type="date"
                  value={newSchool.endDate}
                  onChange={(e) => setNewSchool({ ...newSchool, endDate: e.target.value })}
                  className="w-full px-4 py-2 rounded border"
                />
              </div>
              <select
                value={newSchool.country}
                onChange={(e) => setNewSchool({ ...newSchool, country: e.target.value })}
                className="w-full px-4 py-2 rounded border"
              >
                <option value="India">India</option>
                <option value="USA">USA</option>
              </select>
              <button
                className="mt-4 w-full bg-[#0046D2] text-white font-semibold py-2 rounded"
                onClick={handleAddSchool}
              >
                Add School
              </button>
            </div>
          </>
        ) : editMode ? (
          <>
            <h3 className="text-lg font-bold mb-4">✏️ Edit School</h3>
            <div className="space-y-3">
              <input
                className="w-full px-4 py-2 rounded border"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <input
                className="w-full px-4 py-2 rounded border"
                value={editForm.email || ""}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
              <input
                className="w-full px-4 py-2 rounded border"
                value={editForm.phone || ""}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
              <select
                className="w-full px-4 py-2 rounded border"
                value={editForm.country || ""}
                onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
              >
                <option>India</option>
                <option>USA</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded border"
                  value={editForm.startDate || ""}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                />
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded border"
                  value={editForm.endDate || ""}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                />
              </div>
              <button
                className="w-full bg-blue-600 text-white py-2 rounded"
                onClick={handleEditSave}
              >
                Save Changes
              </button>
            </div>
          </>
        ) : selectedSchool ? (
          <>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={selectedSchool.avatar || "/school.jpg"}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div>
                <h3 className="font-semibold text-lg">{selectedSchool.name}</h3>
                <span
                  className={`text-sm font-medium ${
                    selectedSchool.status === "active" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {selectedSchool.status === "active" ? "✅ Active" : "🚫 Disabled"}
                </span>
              </div>
            </div>
            <ul className="text-sm space-y-2 mb-4">
              <li className="flex items-center gap-2"><FiMail /> {selectedSchool.email}</li>
              <li className="flex items-center gap-2"><FiPhone /> {selectedSchool.phone}</li>
              <li className="flex items-center gap-2"><FiMapPin /> {selectedSchool.country}</li>
              <li className="flex items-center gap-2"><FiUsers /> {selectedSchool.students}</li>
              <li className="flex items-center gap-2"><FiUserCheck /> {selectedSchool.teachers}</li>
              <li className="flex items-center gap-2"><FiCalendar /> Start: {selectedSchool.startDate}</li>
              <li className="flex items-center gap-2"><FiCalendar /> End: {selectedSchool.endDate}</li>
            </ul>
            <div className="flex gap-3">
              <button onClick={() => setShowDeactivateModal(true)} className="px-4 py-2 bg-red-100 text-red-600 rounded-full">
                Deactivate
              </button>
              <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full">
                Edit
              </button>
              <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 bg-red-600 text-white rounded-full">
                Delete
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm">No school selected</p>
        )}

        {/* Deactivate Modal */}
        {showDeactivateModal && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-md text-center w-[300px]">
              <h3 className="font-semibold text-lg mb-2">Deactivate School?</h3>
              <p className="text-sm mb-4">This will disable access for all users.</p>
              <div className="flex justify-center gap-3">
                <button className="px-4 py-1 rounded-full border" onClick={() => setShowDeactivateModal(false)}>Cancel</button>
                <button className="px-4 py-1 rounded-full bg-red-600 text-white" onClick={handleDeactivate}>Deactivate</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-md text-center w-[300px]">
              <h3 className="font-semibold text-lg mb-2">Delete School?</h3>
              <p className="text-sm mb-4">This action is irreversible.</p>
              <div className="flex justify-center gap-3">
                <button className="px-4 py-1 rounded-full border" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="px-4 py-1 rounded-full bg-black text-white" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}