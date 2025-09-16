"use client";

type TermTabsProps = {
  selectedTerm?: number;
  onSelect: (termIndex?: number) => void;
};

export default function TermTabs({ selectedTerm, onSelect }: TermTabsProps) {
  const terms = [1, 2, 3, 4]; // static terms

  return (
    <div className="flex space-x-4 text-sm font-medium">
      {/* Optional: "All Terms" to clear selection */}
      <button
        onClick={() => onSelect(undefined)}
        className={`px-5 py-2 rounded-t-xl transition ${
          selectedTerm === undefined
            ? "bg-white text-[#2C2F5A] font-bold"
            : "bg-[#F6F8FF] text-gray-600"
        }`}
      >
        All Terms
      </button>

      {terms.map((term) => (
        <button
          key={term}
          onClick={() => onSelect(term)}
          className={`px-5 py-2 rounded-t-xl transition ${
            selectedTerm === term
              ? "bg-white text-[#2C2F5A] font-bold"
              : "bg-[#F6F8FF] text-gray-600"
          }`}
        >
          Term {term}
        </button>
      ))}
    </div>
  );
}
