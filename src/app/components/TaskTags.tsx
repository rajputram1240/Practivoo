"use client";

import { useState } from "react";

export default function TaskTags() {
  const tags = ["Vocabulary", "Parts Of Speech", "Grammar", "Noun", "Preposition"];
  const [activeTag, setActiveTag] = useState("Vocabulary");

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => setActiveTag(tag)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition 
            ${
              activeTag === tag
                ? "bg-black text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}