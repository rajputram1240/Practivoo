"use client";

type TermTabsProps = {
  selectedTerm: number;
  onSelect: (termIndex: number) => void;
};

export default function TermTabs({ selectedTerm, onSelect }: TermTabsProps) {
  const terms = ["Term 1", "Term 2", "Term 3"];

  return (
    <div className="flex space-x-4 text-sm font-medium">
      {terms.map((term, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={`px-5 py-2 rounded-t-xl transition ${
            selectedTerm === index
              ? "bg-white text-[#2C2F5A] font-bold"
              : "bg-[#F6F8FF] text-gray-600"
          }`}
        >
          {term}
        </button>
      ))}
    </div>
  );
}