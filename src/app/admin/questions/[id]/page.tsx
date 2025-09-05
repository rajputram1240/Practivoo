'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { QuesAnsComponents } from '@/app/components/QuesAnsComponent';
import { PlusCircle } from 'lucide-react';

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
  matchThePairs?: matchThePairs[];
  questiontype: string;
  type: 'single' | 'multi';
}

const questiontypes: string[] = [
  "MCQs",
  "Fill in the gaps",
  "Match The Pairs",
  "Word Order exercise",
  "Find the Mistakes",
  "Complete The Sentence"
];

export default function EditQuestionPage() {
  const params = useParams() as { id: string };
  const id = params.id;
  const router = useRouter();

  const [question, setQuestion] = useState<Question | null>(null);
  const [preview, setPreview] = useState<{ image?: string; audio?: string }>({});
  const [activeQuesType, setActiveQuesType] = useState("MCQs");

  // fetch existing question
  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/admin/questions/${id}`);
      const data = await res.json();
      if (res.ok && data.question) {
        setQuestion(data.question);
        setActiveQuesType(data.question.questiontype || "MCQs");
      } else {
        toast.error('Failed to load question');
      }
    }
    if (id) fetchData();
  }, [id]);

  // helper to update fields
  const updateCurrent = (data: Partial<Question>) => {
    if (!question) return;
    setQuestion(prev => prev ? { ...prev, ...data } : null);
  };

  // options
  console.log(question);
  const updateOption = (index: number, value: string) => {
    if (!question) return;
    const updatedOptions = [...question.options];
    updatedOptions[index] = value;
    updateCurrent({ options: updatedOptions });
  };

  const addOption = () => {
    if (!question) return;
    updateCurrent({ options: [...question.options, ""] });
  };

  const removeOption = (index: number) => {
    if (!question) return;
    const newOptions = question.options.filter((_, i) => i !== index);
    const newCorrectAnswer =
      question.correctAnswer === question.options[index] ? "" : question.correctAnswer;
    updateCurrent({ options: newOptions, correctAnswer: newCorrectAnswer });
  };

  const setAsCorrectAnswer = (index: number) => {
    if (!question) return;
    updateCurrent({ correctAnswer: question.options[index] });
  };
  // media
  const handleMediaUpload = async (file: File, type: 'image' | 'audio') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (res.ok && data.url) {
      updateCurrent({
        media: { ...question?.media, [type]: data.url }
      });
      setPreview(prev => ({ ...prev, [type]: undefined }));
      toast.success(`${type} uploaded`);
    } else {
      toast.error('Upload failed');
    }
  };

  // pair upload for edit mode
  const handlePairUpload = async (
    file: File | null,
    value: string,
    pairIndex: number
  ) => {
    if (!question) return;

    let imageUrl: string | undefined;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (res.ok && data.url) {
          imageUrl = data.url;
          toast.success("Image uploaded!");
        } else {
          toast.error("Pair upload failed");
          return;
        }
      } catch (err) {
        toast.error("Pair upload failed");
        return;
      }
    }

    const updatedPairs = [...(question.matchThePairs || [])];
    updatedPairs[pairIndex] = {
      ...(updatedPairs[pairIndex] || {}),
      ...(imageUrl ? { key: imageUrl } : {}),
      ...(value ? { value } : {}),
    };

    updateCurrent({ matchThePairs: updatedPairs });
  };


  const clearMedia = (type: "image" | "audio") => {
    if (!question) return;
    setPreview(prev => ({ ...prev, [type]: undefined }));
    const updated = { ...question.media };
    delete updated[type];
    updateCurrent({ media: updated });
    console.log(question);
  };

  const showPreview = (file: File, type: "image" | "audio") => {
    const url = URL.createObjectURL(file);
    setPreview((prev) => ({ ...prev, [type]: url }));
  };

  // save changes
  const handleSave = async () => {
    if (!question) return;
    const res = await fetch(`/api/admin/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    });
    if (res.ok) {
      toast.success('Question updated!');
      router.push('/admin/questions');
    } else {
      toast.error('Update failed!');
    }
  };

  if (!question) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold">Edit Question</h2>

      <input
        placeholder="Heading"
        className="w-full border border-gray-500 p-2 rounded-lg"
        value={question.heading}
        onChange={(e) => updateCurrent({ heading: e.target.value })}
      />

      {/* Question type selector */}
      <h1 className="font-semibold text-md">Select Type</h1>
      <div className="flex flex-wrap text-sm gap-2">
        {questiontypes.map((type) => (
          <button
            key={type}
            onClick={() => {
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

      {/* Question & Answers */}
      <QuesAnsComponents
        current={question}
        activeQuesType={activeQuesType}
        activeIndex={0} // only one question in edit mode
        addOption={addOption}
        updateOption={updateOption}
        setAsCorrectAnswer={setAsCorrectAnswer}
        removeOption={removeOption}
        updateCurrent={updateCurrent}
        handleMediaUpload={handleMediaUpload}
        clearMedia={clearMedia}
        showPreview={showPreview}
        preview={preview}
        handlePairUpload={handlePairUpload} // optional in edit, depends on your component
      />

      {/* Explanation */}
      <div>
        <label className="font-semibold">Explanation</label>
        <textarea
          className="w-full border border-gray-500 p-2 rounded mt-1"
          value={question.explanation}
          onChange={(e) => updateCurrent({ explanation: e.target.value })}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => router.push('/admin/questions')}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
