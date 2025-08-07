'use client';

import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { toast } from "react-toastify"; 
import { useRouter } from "next/navigation";


interface Question {
  heading: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  media: {
    image?: string;
    audio?: string;
  };
  type: 'single' | 'multi';
}

const defaultQuestion = (): Question => ({
  heading: "",
  question: "",
  options: [""],
  correctAnswer: "",
  explanation: "",
  media: {},
  type: "single",
});

export default function CreateQuestionPage() {
  const [questions, setQuestions] = useState<Question[]>([defaultQuestion()]);
  const [activeIndex, setActiveIndex] = useState(0);
  const current = questions[activeIndex];
  const router = useRouter();

  const updateCurrent = (data: Partial<Question>) => {
    const updated = [...questions];
    updated[activeIndex] = { ...updated[activeIndex], ...data };
    setQuestions(updated);
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...current.options];
    updatedOptions[index] = value;
    updateCurrent({ options: updatedOptions });
  };

  const setAsCorrectAnswer = (index: number) => {
    updateCurrent({ correctAnswer: current.options[index] });
  };

  const addOption = () => {
    updateCurrent({ options: [...current.options, ""] });
  };

  const removeOption = (index: number) => {
    const newOptions = current.options.filter((_, i) => i !== index);
    const newCorrectAnswer =
      current.correctAnswer === current.options[index] ? "" : current.correctAnswer;
    updateCurrent({ options: newOptions, correctAnswer: newCorrectAnswer });
  };

  const addNextQuestion = () => {
    setQuestions([...questions, defaultQuestion()]);
    setActiveIndex(questions.length);
  };

  const deleteQuestion = () => {
    if (questions.length <= 1) return;
    const updated = questions.filter((_, i) => i !== activeIndex);
    setQuestions(updated);
    setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
  };

  const handleMediaUpload = async (file: File, type: 'image' | 'audio', index: number) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (res.ok && data.url) {
    const updated = [...questions];
    updated[index].media = {
      ...updated[index].media,
      [type]: data.url,
    };
    setQuestions(updated);
  } else {
    alert('Upload failed');
  }
};


const handleSubmit = async () => {
  try {
    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questions }),
    });

    const data = await res.json();
    if (res.ok) {
      
       toast.success("Questions saved successfully!");
       router.push('/admin/questions')
      setQuestions([defaultQuestion()]);
      setActiveIndex(0);
    } else {
      console.error(data);
      alert(data?.error || 'Failed to save questions');
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong while saving questions');
  }
};

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Create New Question</h2>

      {/* Question navigation */}
      <div className="flex flex-wrap gap-2">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-8 h-8 text-sm rounded-full border ${i === activeIndex ? "bg-blue-600 text-white" : "bg-white"}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question Form */}
      <div className="border rounded p-4 space-y-4 bg-white">
        <input
          placeholder="Heading"
          className="w-full border p-2 rounded"
          value={current.heading}
          onChange={(e) => updateCurrent({ heading: e.target.value })}
        />

        {/* Type */}
        <div className="flex gap-2">
          {["single", "multi"].map((t) => (
            <button
              key={t}
              onClick={() => updateCurrent({ type: t as 'single' | 'multi' })}
              className={`border px-3 py-1 rounded ${current.type === t ? "bg-black text-white" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>

        <textarea
          placeholder="Enter your question..."
          className="w-full border p-2 rounded"
          value={current.question}
          onChange={(e) => updateCurrent({ question: e.target.value })}
        />

        {/* Options */}
        <div>
          <label className="font-semibold">Options</label>
          <div className="space-y-2 mt-2">
            {current.options.map((opt, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  className="border px-2 py-1 rounded flex-1"
                />
                <button onClick={() => setAsCorrectAnswer(idx)}>
                  <Check
                    size={20}
                    className={current.correctAnswer === opt ? "text-green-600" : "text-gray-400"}
                  />
                </button>
                <button onClick={() => removeOption(idx)}>
                  <Trash2 size={18} className="text-red-500" />
                </button>
              </div>
            ))}
            <button onClick={addOption} className="text-sm text-blue-600 mt-1">
              + Add Option
            </button>
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="font-semibold">Explanation</label>
          <textarea
            className="w-full border p-2 rounded mt-1"
            value={current.explanation}
            onChange={(e) => updateCurrent({ explanation: e.target.value })}
          />
        </div>

        {/* Single Media Upload Input */}
<div className="mt-4">
  <label className="font-semibold">Upload Image or Audio</label>
  <input
  type="file"
  accept="image/*,audio/*"
  onChange={(e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const fileType = file.type.startsWith('image') ? 'image' : 'audio';
      handleMediaUpload(file, fileType as 'image' | 'audio', activeIndex); // ✅ pass active question index
    }
  }}
/>
</div>

{/* Preview */}
{current.media.image && (
  <div className="mt-2">
    <p className="text-sm font-medium">Image Preview:</p>
    <img src={current.media.image} alt="Preview" className="w-32 rounded mt-1" />
  </div>
)}

{current.media.audio && (
  <div className="mt-2">
    <p className="text-sm font-medium">Audio Preview:</p>
    <audio controls className="mt-1">
      <source src={current.media.audio} />
      Your browser does not support audio.
    </audio>
  </div>
)}

        {/* Footer */}
        <div className="flex justify-between mt-4">
          <button
            onClick={deleteQuestion}
            className="text-sm border px-4 py-1 rounded text-red-600"
          >
            🗑️ Delete Question
          </button>
          <div className="flex gap-4">
            <button
              onClick={addNextQuestion}
              className="border px-4 py-1 rounded text-sm"
            >
              ➕ Add Next Question
            </button>
            <button
  onClick={handleSubmit}
  className="bg-black text-white px-4 py-1 rounded text-sm"
>
  💾 Save {questions.length} Questions
</button>

          </div>
        </div>
      </div>
    </div>
  );
}