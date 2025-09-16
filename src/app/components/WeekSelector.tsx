"use client";

interface WeekSelectorProps {
  selectedweek?: number;
  onSelect: (week?: number) => void;
}

export default function WeekSelector({ selectedweek, onSelect }: WeekSelectorProps) {
  const weeks = [1,2,3,4,5,6,7,8,9,10,11,12]; // static weeks

  return (
    <div className="flex gap-2 flex-wrap">
      {/* Optional: "All Weeks" button */}
      <button
        onClick={() => onSelect(undefined)}
        className={`px-4 py-[6px] text-sm rounded-full border font-medium transition-all ${
          selectedweek === undefined
            ? "bg-black text-white border-black"
            : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
        }`}
      >
        All Weeks
      </button>

      {weeks.map((week) => (
        <button
          key={week}
          onClick={() => onSelect(week)}
          className={`px-4 py-[6px] text-sm rounded-full border font-medium transition-all ${
            selectedweek === week
              ? "bg-black text-white border-black"
              : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Week-{week}
        </button>
      ))}
    </div>
  );
}
