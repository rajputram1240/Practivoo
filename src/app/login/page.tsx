"use client";

import { useState } from "react";
import { FaBuilding, FaLock } from "react-icons/fa";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [orgCode, setOrgCode] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Optional: Add form validation here
    login(); // triggers navigation to /dashboard
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0046D2] p-4 md:p-8">
      <div className="bg-white rounded-[60px] overflow-hidden flex flex-col md:flex-row w-full max-w-6xl shadow-xl">
        {/* Left Side */}
        <div className="md:w-1/2 flex justify-center items-center p-6">
          <div className="w-full h-full bg-[#0046D2] text-white flex flex-col items-center justify-center px-10 py-20 rounded-[60px] shadow-md">
            <div className="text-6xl font-bold">P</div>
            <div className="text-2xl mt-1">Practivoo</div>
            <div className="text-sm text-center mt-10 leading-5">
              <p>Practice Today</p>
              <p>Progress Tomorrow</p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="md:w-1/2 flex items-center justify-center px-6 md:px-10 py-16">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-1">
              Welcome To Practivoo
            </h1>
            <p className="text-center text-gray-600 text-sm mb-8">
              Please Enter Your Details
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Org Code */}
              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2">
                <FaBuilding className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Enter Your Organization Code"
                  className="w-full outline-none bg-transparent text-sm"
                  value={orgCode}
                  onChange={(e) => setOrgCode(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col space-y-1">
                <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2">
                  <FaLock className="text-gray-400 mr-2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full outline-none bg-transparent text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400"
                  >
                    {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </button>
                </div>
                <div className="text-right">
                  <a href="#" className="text-xs text-red-500 hover:underline">
                    Forgot Password?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#7DA5F8] text-white py-2 rounded-full text-sm font-semibold hover:bg-blue-600"
              >
                Next
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}