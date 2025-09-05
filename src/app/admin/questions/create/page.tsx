'use client';

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { QuesAnsComponents } from "@/app/components/QuesAnsComponent";


export interface matchThePairs {
  key: string;
  value: string;

}
export interface Question {
  heading: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  media: {
    image?: string;
    audio?: string;
  };
  matchThePairs?: matchThePairs[];// [{ img/word: string; word: string }] 
  questiontype: string; // mcq,fill in the gaps,match the pairs,word order exercise
  type: 'single' | 'multi';
}

const defaultQuestion = (): Question => ({
  heading: "",
  question: "",
  options: [""],
  correctAnswer: "",
  explanation: "",
  media: {},
  questiontype: "MCQs",
  matchThePairs: [],
  type: "single",
});

const questiontypes: string[] = [
  "MCQs",
  "Fill in the gaps",
  "Match The Pairs",
  "Word Order exercise",
  "Find the Mistakes",
  "Complete The Sentence"
];
export default function CreateQuestionPage() {
  const [activeQuesType, setActiveQuesType] = useState("MCQs");
  const [questions, setQuestions] = useState<Question[]>([defaultQuestion()]);
  const [activeIndex, setActiveIndex] = useState(0);
  const current = questions[activeIndex];
  const router = useRouter();


  const updateCurrent = (data: Partial<Question>) => {
    const updated = [...questions];
    updated[activeIndex] = { ...updated[activeIndex], ...data };
    setQuestions(updated);
    console.log(updated);
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

  const [preview, setPreview] = useState<{ image?: string; audio?: string }>({});

  const showPreview = (file: File, type: "image" | "audio") => {
    const url = URL.createObjectURL(file);
    setPreview((prev) => ({ ...prev, [type]: url }));
  };


  const handlePairUpload = async (
    file: File,
    value: string,
    qIndex: number,
    pairIndex: number
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "image");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      console.log(data)
      if (res.ok && data.url) {
        const updated = [...questions];
        if (!updated[qIndex].matchThePairs) {
          updated[qIndex].matchThePairs = [];
        }
        updated[qIndex].matchThePairs[pairIndex] = {
          key: data.url,
          value,
        };

        setQuestions(updated);
      } else {
        alert("Pair Upload failed ");

        setQuestions((prev) => {
          const updated = [...prev];
          if (updated[qIndex]?.matchThePairs) {
            updated[qIndex].matchThePairs.splice(pairIndex, 1);
          }
          return updated;
        });
      }
    } catch (err) {
      alert("Pair Upload failed");

    }
  };

  const handleMediaUpload = async (
    file: File,
    type: "image" | "audio",
    index: number
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
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

        // once uploaded, replace local preview with server url
        setPreview((prev) => ({ ...prev, [type]: undefined }));
      } else {
        clearMedia(type, index); // rollback
        alert("Upload failed");
      }
    } catch (err) {
      clearMedia(type, index);
      alert("Upload failed");
    }
  };

  const clearMedia = (type: "image" | "audio", index: number) => {
    setPreview((prev) => ({ ...prev, [type]: undefined }));

    const updated = [...questions];
    if (updated[index]?.media) {
      delete updated[index].media[type];
    }
    /*   else if (!updated[index]?.matchThePairs) {
        updated[index].matchThePairs = [];
      } */
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    try {

      const sanitized = questions.map(q => {
        if (q.questiontype === "Match The Pairs") {
          return { ...q, options: [], correctAnswer: "" };
        }
        return q;
      });

      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: sanitized }),
      });
      console.log(questions)
      const data = await res.json();
      if (res.ok) {

        console.log(res)
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
            onClick={() => {
              setActiveIndex(i);
              setActiveQuesType(questions[i].questiontype || "MCQs");
            }}
            className={`w-8 h-8 text-sm rounded-full border border-gray-500 ${i === activeIndex ? "bg-blue-600 text-white" : "bg-white"}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question Form */}
      <div className="border border-gray-500 rounded-lg p-4 space-y-4 bg-white">
        <input
          placeholder="Heading"
          className="w-full border border-gray-500 p-2 rounded-lg"
          value={current.heading}
          onChange={(e) => updateCurrent({ heading: e.target.value })}
        />

        {/* Type */}
        {/*     <div className="flex gap-2">
          {["single", "multi"].map((t) => (
            <button
              key={t}
              onClick={() => updateCurrent({ type: t as 'single' | 'multi' })}
              className={`border border-gray-500 px-3 py-1 rounded ${current.type === t ? "bg-black text-white" : ""}`}
            >
              {t}
            </button>
          ))}
        </div> */}
        {/* Question types */}
        <h1 className="  font-semibold text-md">Select Types</h1>
        <div className="flex flex-wrap text-sm gap-2">
          {questiontypes.map((type) => (
            <button
              key={type}
              /*  onClick={() => {
                 setQuestions([...questions, defaultQuestion()]);
                 updateCurrent({ questiontype: type || "" });
                 setActiveQuesType(type);
               }} */
              onClick={() => {
                // reset only the current question
                updateCurrent({
                  questiontype: type,
                  question: "",
                  options: [""],
                  correctAnswer: "",
                  matchThePairs: [],
                  media: {},
                });
                setActiveQuesType(type);
              }}
              className={`border border-gray-500 flex items-center text-lg px-3 py-2 gap-3 rounded-lg ${activeQuesType === type
                ? "bg-black text-white"
                : "bg-white text-black"
                }`}
            >
              <PlusCircle className="size-5" />
              {type}

            </button>
          ))}
        </div>

        {/* Q&A Component */}
        <QuesAnsComponents
          current={current}
          activeQuesType={activeQuesType}
          activeIndex={activeIndex}
          addOption={addOption}
          updateOption={updateOption}
          setAsCorrectAnswer={setAsCorrectAnswer}
          removeOption={removeOption}
          updateCurrent={updateCurrent}
          handleMediaUpload={handleMediaUpload}
          clearMedia={clearMedia}
          showPreview={showPreview}
          preview={preview}
          handlePairUpload={handlePairUpload}

        />
        {/* Explanation */}
        <div>
          <label className="font-semibold">Explanation</label>
          <textarea
            className="w-full border border-gray-500 p-2 rounded mt-1"
            value={current.explanation}
            onChange={(e) => updateCurrent({ explanation: e.target.value })}
          />
        </div>

        <div>
          <label className="font-semibold">Additional Message</label>
          <textarea
            className="w-full border border-gray-500 p-2 rounded mt-1"
            value={current.explanation}
            onChange={(e) => updateCurrent({ explanation: e.target.value })}
          />
        </div>
        {/* Footer */}
        <div className="flex justify-between mt-4">
          <button
            onClick={deleteQuestion}
            className="text-sm border border-gray-500 px-4 py-1 rounded text-red-600"
          >
            🗑️ Delete Question
          </button>
          <div className="flex gap-4">
            <button
              onClick={addNextQuestion}
              className="border border-gray-500 px-4 py-1 rounded text-sm"
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
    </div >
  );
}