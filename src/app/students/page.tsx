"use client";

import DashboardLayout from "../components/DashboardLayout";
import StudentProfile from "../components/StudentProfile";
import StudentTable from "../components/StudentTable";
import { useEffect, useState } from "react";


export default function StudentsPage() {
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [levels, setLevels] = useState([]);

  const [schoolId, setSchoolId] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchLevels();
  }, []);


  const fetchStudents = async () => {
    let schoolId = JSON.parse(localStorage.getItem("school") || "")._id || ""
    setSchoolId(schoolId);
    try {
      const res = await fetch(`/api/students?schoolId=${schoolId}`);
      const data = await res.json();
      console.log(data)
      const studentsList = data.students || [];
      setStudents(studentsList);
      console.log(data.students)
      getsessionStudentName(studentsList);
      console.log(data.students)
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchLevels = async () => {
    try {
      let schoolId = JSON.parse(localStorage.getItem("school") || "")._id || ""
      const res = await fetch(`/api/levels/override`)
      const data = await res.json();
      console.log(data.levels)
      setLevels(data?.levels || []);
    } catch (err) {
      console.error("Error fetching levels:", err);
    }
  };

  const getsessionStudentName = (studentsList: any[]) => {
    const studentId = sessionStorage.getItem("studentid");
    if (studentId) {
      const foundstudent = studentsList.find((t) => t._id === studentId);
      if (foundstudent) {
        setSelectedStudent(foundstudent);
      }
    }
  };
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-8">
          <StudentTable onSelectStudent={setSelectedStudent} levels={levels} students={students} setStudents={setStudents} />
        </div>
        <div className="lg:col-span-4">
          {selectedStudent ? (
            <StudentProfile
              student={selectedStudent}
              setStudent={setSelectedStudent}
              levels={levels}
              setStudents={setStudents} />
          ) : (
            <div className="text-center text-gray-500 p-6 bg-white rounded-xl shadow">
              Select a student to view profile
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}