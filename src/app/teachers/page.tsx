"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import TeachersProfile from "../components/TeachersProfile";
import TeachersTable from "../components/TeachersTable";


export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [levels, setLevels] = useState([]);
  const [schoolId, setSchoolId] = useState("");

  useEffect(() => {

    fetchTeachers();
    fetchLevels();
  }, []);

  const fetchTeachers = async () => {
    let schoolId = JSON.parse(localStorage.getItem("school") || "")._id || ""
    const res = await fetch(`/api/teachers?schoolId=${schoolId}`);
    const data = await res.json();
    const teachersList = data.teachers || [];
    setTeachers(teachersList);

    // 🔑 Pick the correct teacher if sessionStorage has one
    getsessionTeacherName(teachersList);
  };

  const fetchLevels = async () => {
    let schoolId = JSON.parse(localStorage.getItem("school") || "")._id || ""
    const res = await fetch(`/api/levels/override`)
    const data = await res.json();
    console.log(data.levels)
    setLevels(data?.levels || []);
    setLevels(data.levels || []);
  };

  const getsessionTeacherName = (teachersList: any[]) => {
    const teacherId = sessionStorage.getItem("teacherid");
    if (teacherId) {
      const foundTeacher = teachersList.find((t) => t._id === teacherId);
      if (foundTeacher) {
        setSelectedTeacher(foundTeacher);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-8">
          <TeachersTable
            teachers={teachers}
            levels={levels}
            onSelectTeacher={setSelectedTeacher}
          />
        </div>

        <div className="lg:col-span-4">
          {selectedTeacher ? (
            <TeachersProfile
              teacher={selectedTeacher}
              setTeacher={setSelectedTeacher}
              levels={levels}
              setTeachers={setTeachers}
            />
          ) : (
            <div className="text-center text-gray-500 p-6 bg-white rounded-xl shadow">
              Select a teacher to view profile
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}