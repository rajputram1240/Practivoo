"use client";

import { IoChevronBackSharp } from "react-icons/io5";
import { FiSend } from "react-icons/fi";

export default function MessageBox({ onBack }: { onBack: () => void }) {
  const messages = [
    { day: "Today", content: ["Lorem ipsum dolor sit amet, consectetur adipisicing", "Lorem ipsum dolor sit amet, consectetur adipisicing"] },
    { day: "Yesterday", content: ["Lorem ipsum dolor sit amet, consectetur adipisicing", "Lorem ipsum dolor sit amet, consectetur adipisicing"] },
  ];

  return (
    <div className="bg-white w-full max-w-sm h-full p-4 rounded-2xl shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center relative mb-4">
        <button onClick={onBack} className="absolute left-0 text-xl text-black">
          <IoChevronBackSharp />
        </button>
        <h2 className="text-lg font-bold text-black">Joy</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((section, idx) => (
          <div key={idx}>
            <p className="text-xs text-center text-gray-500 mb-2">{section.day}</p>
            {section.content.map((msg, i) => (
              <div key={i} className="mb-2">
                <div className="bg-[#EDF1FF] rounded-xl px-4 py-2 text-sm text-gray-800 w-fit max-w-[80%]">
                  {msg}
                </div>
                <p className="text-[10px] text-right text-gray-400 pr-1 mt-1">9:30 AM</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="mt-4">
        <div className="bg-black rounded-full flex items-center px-4 py-2">
          <input
            type="text"
            placeholder="Type here"
            className="flex-1 bg-transparent text-white placeholder:text-gray-400 text-sm outline-none"
          />
          <button className="text-white text-lg">
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
}