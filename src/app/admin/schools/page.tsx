"use client";

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiSearch } from 'react-icons/fi';

type SchoolType = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  status?: string;
  createdAt: string;
};

export default function SchoolsPage() {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolType | null>(null);
  const [search, setSearch] = useState('');
  const [editForm, setEditForm] = useState<Partial<SchoolType>>({});
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const res = await fetch('/api/admin/schools');
      const data = await res.json();
      setSchools(data.data || []);
    } catch (err) {
      toast.error('Failed to fetch schools');
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (res.ok) {
        setSchools([...schools, data.data]);
        toast.success('School created!');
        setCreateForm({ name: '', email: '', password: '', phone: '', address: '' });
      } else {
        toast.error(data.message || 'Create failed');
      }
    } catch {
      toast.error('Server error');
    }
  };

  const handleEdit = async () => {
    if (!selectedSchool) return;
    try {
      const res = await fetch('/api/admin/schools', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedSchool._id, ...editForm }),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedList = schools.map(s => (s._id === data.data._id ? data.data : s));
        setSchools(updatedList);
        setSelectedSchool(data.data);
        toast.success('School updated');
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch {
      toast.error('Server error');
    }
  };

  const handleDelete = async () => {
    if (!selectedSchool) return;
    const confirmed = window.confirm('Delete this school?');
    if (!confirmed) return;

    try {
      const res = await fetch('/api/admin/schools', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedSchool._id }),
      });
      const data = await res.json();
      if (res.ok) {
        const filtered = schools.filter(s => s._id !== selectedSchool._id);
        setSchools(filtered);
        setSelectedSchool(null);
        toast.success('School deleted');
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch {
      toast.error('Server error');
    }
  };

  const filteredSchools = schools.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (id: string, newStatus: string) => {
  try {
    const res = await fetch('/api/admin/schools', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
    const data = await res.json();
    if (res.ok) {
      setSchools(schools.map(s => (s._id === id ? { ...s, status: newStatus } : s)));
      toast.success(`School ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } else {
      toast.error(data.message || 'Status update failed');
    }
  } catch {
    toast.error('Server error');
  }
};

  return (
    <div className="p-6 flex gap-6">
      {/* Left: School List */}
      <div className="w-2/3 bg-[#F4F6FE] p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">🏫 Schools</h2>
          <button
            onClick={() => setSelectedSchool(null)}
            className="px-4 py-2 bg-white text-blue-600 rounded-full border"
          >
            + Add New
          </button>
        </div>

        <div className="relative mb-4">
          <FiSearch className="absolute top-3 left-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name"
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <table className="w-full text-sm">
          <thead>
  <tr className="text-left">
    <th className="py-2">Name</th>
    <th>Email</th>
    <th>Status</th>
  </tr>
</thead>
          <tbody>
  {filteredSchools.map((school) => (
    <tr
      key={school._id}
      className={`cursor-pointer hover:bg-white ${
        selectedSchool?._id === school._id ? 'bg-white' : ''
      }`}
      onClick={() => {
        setSelectedSchool(school);
        setEditForm(school);
      }}
    >
      <td className="py-2">{school.name}</td>
      <td>{school.email}</td>
      <td>
        <button
          className={`px-2 py-1 text-xs rounded ${
            school.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
          }`}
          onClick={(e) => {
            e.stopPropagation(); // prevent row click
            toggleStatus(school._id, school.status === 'active' ? 'inactive' : 'active');
          }}
        >
          {school.status === 'active' ? 'Active' : 'Inactive'}
        </button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>

      {/* Right: Create/Edit Panel */}
      <div className="w-1/3 bg-white p-6 rounded-xl shadow">
        {selectedSchool ? (
          <>
            <h3 className="text-lg font-bold mb-4">✏️ Edit School</h3>
            <input
              className="w-full border mb-3 p-2 rounded"
              value={editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
            <input
              className="w-full border mb-3 p-2 rounded"
              value={editForm.email || ''}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
            <input
              className="w-full border mb-3 p-2 rounded"
              value={editForm.phone || ''}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
            <input
              className="w-full border mb-3 p-2 rounded"
              value={editForm.address || ''}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
            />
            <div className="flex justify-between">
              <button onClick={handleEdit} className="bg-blue-600 text-white px-4 py-2 rounded">
                Save
              </button>
              <button onClick={handleDelete} className="text-red-600 px-4 py-2 rounded border">
                Delete
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold mb-4">➕ Add School</h3>
            <input
              className="w-full border mb-3 p-2 rounded"
              placeholder="Name"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            />
            <input
              className="w-full border mb-3 p-2 rounded"
              placeholder="Email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            />
            <input
              type="password"
              className="w-full border mb-3 p-2 rounded"
              placeholder="Password"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            />
            <input
              className="w-full border mb-3 p-2 rounded"
              placeholder="Phone"
              value={createForm.phone}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
            />
            <input
              className="w-full border mb-3 p-2 rounded"
              placeholder="Address"
              value={createForm.address}
              onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
            />
            <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
              Create
            </button>
          </>
        )}
      </div>
    </div>
  );
}