"use client";

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiLock, FiSearch } from 'react-icons/fi';
import AddSchool from '@/app/components/AddSchool';
import { Edit2, EyeOff, School, School2, Trash2 } from 'lucide-react';
import { MdEmail } from 'react-icons/md';
import { PiStudent } from 'react-icons/pi';
import { GiTeacher } from 'react-icons/gi';
type SchoolType = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  status?: string;
  createdAt: string;
  password?: string;
  avatar?: string;
  studentCount?: string
  teacherCount?: string
};

export default function SchoolsPage() {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [addSchoolstate, setaddSchoolstate] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolType | null>(null);
  const [search, setSearch] = useState('');
  const [editState, seteditState] = useState(false);
  const [editForm, setEditForm] = useState<Partial<SchoolType>>({});
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: 'No address found',
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const res = await fetch('/api/admin/schools');
      const data = await res.json();
      setSchools(data.data || []);
      console.log(data.data);
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
        return data.data; // return the new school
      } else {
        toast.error(data.message || 'Create failed');
        return null;
      }
    } catch {
      toast.error('Server error');
      return null;
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
        const updatedList = schools.map(s =>
          s._id === data.data._id ? data.data : s
        );
        setSchools(updatedList);
        setSelectedSchool(data.data);
        toast.success('School updated');
        seteditState(false);
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
        if (selectedSchool && selectedSchool._id === id) {
          setSelectedSchool({
            ...selectedSchool,
            status: newStatus,
          });
        }
        toast.success(`School ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      } else {
        toast.error(data.message || 'Status update failed');
      }
    } catch {
      toast.error('Server error');
    }
  };

  return (
    <>
      {addSchoolstate ? (
        <>
          {/* Add Schools */}
          <AddSchool
            createForm={createForm}
            setCreateForm={setCreateForm}
            setaddSchoolstate={setaddSchoolstate}
            handleCreate={handleCreate}
          />
        </>
      ) : (
        <div className="p-6 flex gap-6">
          {/* All School List/Menu */}
          <div className="w-2/3 bg-[#F4F6FE] p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">🏫 Schools</h2>
              <button
                onClick={() => setaddSchoolstate(true)}
                className="px-4 py-2 bg-white text-blue-600 rounded-full border"
              >
                + Add New School
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
                    className={`cursor-pointer hover:bg-white ${selectedSchool?._id === school._id ? "bg-white" : ""
                      }`}
                    onClick={() => setSelectedSchool(school)}
                  >
                    <td className="py-2">{school.name}</td>
                    <td>{school.email}</td>
                    <td>
                      <button
                        className={`px-2 py-1 text-xs rounded ${school.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                          }`}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent row click
                          toggleStatus(
                            school._id,
                            school.status === "active" ? "inactive" : "active"
                          );
                        }}
                      >
                        {school.status === "active" ? "Active" : "Inactive"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: Create/Edit Panel */}
          <div className="w-1/3 bg-white p-6 rounded-xl shadow">
            {editState ? (
              <>
                <h3 className="text-lg font-bold mb-4">✏️ Edit School</h3>
                <h2 className="text-md font-bold text-gray-800">School Name</h2>
                <input
                  className="w-full border mb-3 p-2 rounded"
                  value={editForm.name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
                <h2 className="text-md font-bold text-gray-800">E-Mail</h2>

                <input
                  className="w-full border mb-3 p-2 rounded"
                  value={editForm.email || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />

                {/*   <h2 className="text-md font-bold text-gray-800">Password</h2>
                <input
                  className="w-full border mb-3 p-2 rounded"
                  value={editForm.password || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, password: e.target.value })
                  }
                /> */}

                <h2 className="text-md font-bold text-gray-800">Phone Number</h2>
                <input
                  className="w-full border mb-3 p-2 rounded"
                  value={editForm.phone || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                />
                <h2 className="text-md font-bold text-gray-800">Address</h2>

                <input
                  className="w-full border mb-3 p-2 rounded"
                  value={editForm.address || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                />
                <div className="flex justify-between">
                  <button
                    onClick={handleEdit}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => seteditState(false)}
                    className="text-red-600 px-4 py-2 rounded border"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : selectedSchool ? (
              <>
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedSchool?.avatar || "/avatar5.png"}
                      alt={selectedSchool?.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div>
                      <div className='flex gap-1 items-center'>


                        <h2 className="text-md font-bold text-gray-800">
                          {selectedSchool?.name || "Unnamed School"}
                        </h2>
                      </div>
                      <p className="text-sm text-gray-400">
                        Status : {selectedSchool?.status === "active" ? <span className="text-green-600 font-bold">Active</span> : <span className="text-red-600 font-bold">Inactive</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/*    
                {selectedSchool?.levels?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSchool.levels.map((level: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs bg-[#EDF1FF] text-blue-800 rounded-full"
                      >
                        {level || "Unknown"}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No levels available</p>
                )} */}

                {/* Classes Overview */}
                {/*     <div className="grid grid-cols-2 gap-3">
                  {(selectedSchool?.classes || []).map((cls: any, idx: number) => (
                    <button
                      key={idx}
                      className="flex items-center justify-between bg-[#EDF1FF] text-sm px-4 py-2 rounded-full text-gray-800 font-medium w-full"
                    >
                      <span>
                        {cls?.name || "Unknown"} -{" "}
                        <span className="font-bold">
                          {cls?.studentCount || 0}
                        </span>
                      </span>
                      <FiChevronRight className="text-gray-500 text-base" />
                    </button>
                  ))}
                </div> */}

                {/* Personal Info */}
                <h4 className="text-lg font-semibold text-gray-800 px-2 my-2">Details</h4>
                <div className="bg-blue-100 mt-2 rounded-xl space-y-4 px-4 py-3">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex gap-1 items-center">
                        <School />
                        <p className="text-black font-bold text-md">Name</p>
                      </div>
                      <span>{selectedSchool?.name || "Unknown"}</span>
                    </div>

                    <div>
                      <div className="flex gap-1 items-center">
                        <MdEmail />
                        <p className="text-black font-bold text-md">Email</p>
                      </div>
                      <span>{selectedSchool?.email || "Not Provided"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex gap-1 items-center">
                        <PiStudent />
                        <p className="text-black font-bold">No. of Students</p>
                      </div>
                      <span>{selectedSchool?.studentCount || "Not Provided"}</span>
                    </div>

                    <div>
                      <div className="flex gap-1 items-center">
                        <GiTeacher />
                        <p className="text-black font-bold">No. of Teachers</p>
                      </div>
                      <span>{selectedSchool?.teacherCount || "Not Provided"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-black font-bold">Date Joined</p>
                      <span>{new Date(selectedSchool?.createdAt).toDateString() || "Not Provided"}</span>
                    </div>

                    <div>
                      <p className="text-black font-bold">End Date</p>
                      <span>{new Date(selectedSchool?.createdAt).toDateString() || "Not Provided"}</span>
                    </div>
                  </div>
                </div>



                {/* Password */}
                <div className="rounded-xl my-3">
                  <h4 className="py-1 px-1 text-md font-semibold text-gray-800 mt-2">
                    Password
                  </h4>
                  <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-xl text-sm">
                    <FiLock className="text-gray-500" />
                    <span>************</span>
                    <EyeOff className="ml-auto text-gray-500" />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div>
                  <h4 className="py-1 px-1 text-md font-semibold text-gray-800 mt-2">
                    Actions
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className={`flex-1 whitespace-nowrap flex items-center justify-center gap-2 bg-blue-100 p-2 rounded-full text-sm text-black ${selectedSchool?.status === "active"
                        ? "text-red-400 bg-red-100"
                        : "bg-green-100 text-green-700"
                        }`}
                      onClick={(e) => {
                        e.stopPropagation(); // prevent row click
                        toggleStatus(
                          selectedSchool._id,
                          selectedSchool.status === "active" ? "inactive" : "active"
                        );
                      }}
                    >
                      {selectedSchool?.status === "active" ? "🚫 Deactivate" : "✅ Activate"}
                    </button>


                    <button
                      onClick={handleDelete}
                      className="whitespace-nowrap flex-1 flex items-center justify-center gap-2 bg-blue-100 p-2 rounded-full text-sm text-black"
                    >
                      <Trash2 /> Delete School
                    </button>
                    <button
                      onClick={() => {
                        setEditForm(selectedSchool);
                        seteditState(true)
                      }}
                      className="whitespace-nowrap flex-1 flex items-center justify-center gap-2 bg-blue-100 py-2 rounded-full text-sm text-black"
                    >
                      <Edit2 /> Edit Details
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center">Select School to view</p>
            )}
          </div>
        </div>
      )}
    </>
  );
  ;
}