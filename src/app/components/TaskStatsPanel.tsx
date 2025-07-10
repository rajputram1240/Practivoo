import { FiEye } from "react-icons/fi";

const submissions = [
  { name: "Gabby", score: "15/20", avatar: "/avatar1.png" },
  { name: "Lisa", score: "0/20", avatar: "/avatar2.png", noSubmission: true },
  { name: "Billy", score: "15/20", avatar: "/avatar3.png" },
  { name: "Day", score: "16/20", avatar: "/avatar4.png" },
  { name: "Kitty", score: "13/20", avatar: "/avatar5.png" },
];

export default function TaskStatsPanel() {
  return (
    <div className="w-[320px] h-[85vh] bg-white rounded-2xl p-4 flex flex-col gap-4 shadow-sm overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#EDF1FF] p-3 rounded-xl">
        <h3 className="font-bold text-sm text-[#2C2F5A]">
          Topic XYZ{" "}
          <span className="text-xs font-normal text-gray-500">
            (20 Ques.)
          </span>
        </h3>
        <button className="text-xs px-3 py-1 rounded-xl border border-[#2C2F5A] text-[#2C2F5A] hover:bg-[#EAF0FF] transition">
          View Questions
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 px-1 text-sm font-medium text-[#2C2F5A]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-black rounded-full" />
          Avg. Score <span className="font-bold ml-1">150/200</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-400 rounded-full" />
          Max. Score <span className="font-bold ml-1">160/200</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-300 rounded-full" />
          Min. Score <span className="font-bold ml-1">110/200</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-black rounded-full" />
          Total Submissions <span className="font-bold ml-1">210/300</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-black rounded-full" />
          Common Mistakes <span className="font-bold ml-1">50/300</span>
        </div>
      </div>

      {/* Submissions Header */}
      <div className="flex justify-between items-center mt-2">
        <h4 className="text-sm font-bold text-[#2C2F5A]">Submissions</h4>
        <button className="text-xs border border-gray-300 px-3 py-1 rounded-full text-gray-600 hover:bg-gray-50">
          Add Filter ⌄
        </button>
      </div>

      {/* Submissions List */}
      <div className="flex flex-col gap-3 pb-2">
        {submissions.map(({ name, score, noSubmission, avatar }, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between px-3 py-2 rounded-full ${
              noSubmission ? "bg-[#F2F2F2]" : "bg-[#EDF1FF]"
            }`}
          >
            <div className="flex items-center gap-3">
              <img
                src={avatar}
                alt={name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-[#2C2F5A]">
                {name} - ({score})
              </span>
            </div>
            <button
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition ${
                noSubmission
                  ? "text-gray-500 border-gray-300 bg-white"
                  : "text-[#0047FF] border-[#0047FF] bg-white hover:bg-[#EAF0FF]"
              }`}
            >
              {noSubmission ? "No Submission" : "View Submission"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}