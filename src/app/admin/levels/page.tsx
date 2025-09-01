'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';

type Level = {
  _id: string;
  code: string;
  defaultName: string;
  order?: number; // optional order field
};

export default function LevelsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [selected, setSelected] = useState<Level | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [defaultName, setDefaultName] = useState('');

  useEffect(() => {
    fetch('/api/admin/levels')
      .then((res) => res.json())
      .then((data) => setLevels(data.levels || []))
      .catch(() => toast.error('Failed to load levels'));
  }, []);

  const resetState = () => {
    setSelected(null);
    setEditMode(false);
    setDefaultName('');
  };

  const handleCreate = async () => {
    if (!defaultName.trim()) {
      toast.error('Please enter level name');
      return;
    }

    const res = await fetch('/api/admin/levels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultName }),
    });

    const data = await res.json();
    if (res.ok) {
      setLevels([...levels, data.level]);
      toast.success('Level created');
      resetState();
    } else {
      toast.error(data.error || 'Failed to create level');
    }
  };

  const handleEdit = async () => {
    if (!selected || !defaultName.trim()) {
      toast.error('Please enter level name');
      return;
    }

    const res = await fetch('/api/admin/levels', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected._id, defaultName }),
    });

    const data = await res.json();
    if (res.ok) {
      setLevels(levels.map((l) => (l._id === selected._id ? data.level : l)));
      toast.success('Level updated');
      resetState();
    } else {
      toast.error(data.error || 'Failed to update level');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this level?');
    if (!confirmed) return;

    const res = await fetch('/api/admin/levels', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setLevels(levels.filter((l) => l._id !== id));
      toast.success('Level deleted');
      resetState();
    } else {
      toast.error('Failed to delete level');
    }
  };

  // 🟢 Handle drag reorder
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const reordered = Array.from(levels);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setLevels(reordered);

    try {
      await fetch('/api/admin/levels/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: reordered.map((l) => l._id) }),
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to save order');
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

        {/* Drag & Drop List */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="levels">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {levels.map((lvl, index) => (
                  <Draggable key={lvl._id} draggableId={lvl._id} index={index}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white p-3 rounded flex justify-between items-center shadow"
                      >
                        <span>{lvl.defaultName}</span>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setSelected(lvl);
                              setEditMode(true);
                              setDefaultName(lvl.defaultName);
                            }}
                          >
                            ✏️
                          </button>
                          <button onClick={() => handleDelete(lvl._id)}>🗑️</button>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Right Panel */}
      <div className="w-1/3 bg-white p-6 rounded-xl shadow">
        {editMode && selected ? (
          <>
            <h3 className="text-lg font-bold mb-2">Edit Level</h3>
            <input
              placeholder="Default Name"
              value={defaultName}
              onChange={(e) => setDefaultName(e.target.value)}
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
            <h3 className="text-lg font-bold mb-2">Create New Level</h3>
            <input
              placeholder="Default Name"
              value={defaultName}
              onChange={(e) => setDefaultName(e.target.value)}
              className="w-full px-4 py-2 rounded border bg-[#e9efff]"
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