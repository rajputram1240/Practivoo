"use client";

import { useEffect, useState } from "react";

type Level = {
  _id: string;
  name: string;
};

export default function LevelsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [selected, setSelected] = useState<Level | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");

  // Load levels on mount
  useEffect(() => {
    fetch("/api/admin/levels")
      .then(res => res.json())
      .then(data => setLevels(data.levels || []));
  }, []);

  const resetState = () => {
    setSelected(null);
    setName("");
    setEditMode(false);
  };

  const handleCreate = async () => {
    const res = await fetch("/api/admin/levels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (res.ok) {
      setLevels([...levels, data.level]);
      resetState();
    }
  };

  const handleEdit = async () => {
    if (!selected) return;
    const res = await fetch(`/api/admin/levels/${selected._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (res.ok) {
      setLevels(levels.map(l => (l._id === selected._id ? data.level : l)));
      resetState();
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this level?");
    if (!confirmed) return;
    const res = await fetch(`/api/admin/levels/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLevels(levels.filter(l => l._id !== id));
      resetState();
    }
  };

  return (
    <div className="flex h-full p-6 gap-6">
      {/* Left Panel */}
      <div className="w-2/3 bg-[#e9efff] p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">📊 Levels</h2>
          <button
            onClick={() => {
              resetState();
              setEditMode(false);
            }}
            className="px-4 py-1 rounded border border-black flex items-center gap-2"
          >
            ➕ Create New Level
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="py-2">Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((lvl) => (
              <tr key={lvl._id} className="hover:bg-white rounded">
                <td className="py-2">{lvl.defaultName}</td>
                <td className="flex gap-3">
                  <button onClick={() => {
                    setSelected(lvl);
                    setEditMode(true);
                    setName(lvl.defaultName);
                  }}>✏️</button>
                  <button onClick={() => handleDelete(lvl._id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right Panel */}
      <div className="w-1/3 bg-white p-6 rounded-xl shadow">
        {editMode && selected ? (
          <>
            <h3 className="text-lg font-bold mb-2">Edit level</h3>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded border bg-[#e9efff]"
            />
            <button
              onClick={handleEdit}
              className="mt-4 w-full py-2 border border-black rounded"
            >
              Save Changes
            </button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold mb-2">Create New level</h3>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded border bg-[#e9efff]"
              placeholder="Level Name"
            />
            <button
              onClick={handleCreate}
              className="mt-4 w-full py-2 border border-black rounded"
            >
              Create Level
            </button>
          </>
        )}
      </div>
    </div>
  );
}