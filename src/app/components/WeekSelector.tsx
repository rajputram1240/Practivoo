"use client";

interface WeekSelectorProps {
  selected: number;
  onSelect: (week: number) => void;
}

export default function WeekSelector({
  selected,
  onSelect,
}: WeekSelectorProps) {
  const weeks = [1, 2, 3, 4, 5, 6];

  return (
    <div className="flex gap-2 flex-wrap">
      {weeks.map((week) => (
        <button
          key={week}
          onClick={() => onSelect(week)}
          className={`px-4 py-[6px] text-sm rounded-full border font-medium transition-all
            ${
              selected === week
                ? "bg-black text-white border-black"
                : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
            }
          `}
        >
          Week-{week}
        </button>
      ))}
    </div>
  );
}