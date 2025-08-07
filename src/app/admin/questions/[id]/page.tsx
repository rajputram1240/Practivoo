'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function EditQuestionPage() {
  const params = useParams() as { id: string };
  const id = params.id;

  const router = useRouter();

  const [questionData, setQuestionData] = useState({
    heading: '',
    question: '',
    type: 'single',
    options: [''],
    correctAnswer: '',
    explanation: '',
    media: { image: '', audio: '' },
  });

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/admin/questions/${id}`);
      const data = await res.json();
      if (data.question) setQuestionData(data.question);
      else toast.error('Failed to load question');
    }
    if (id) fetchData();
  }, [id]);

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...questionData.options];
    updatedOptions[index] = value;
    setQuestionData(prev => ({ ...prev, options: updatedOptions }));
  };

  const handleAddOption = () => {
    setQuestionData(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const handleRemoveOption = (index: number) => {
    const updated = questionData.options.filter((_, i) => i !== index);
    setQuestionData(prev => ({ ...prev, options: updated }));
  };

  const handleMediaUpload = async (file: File, type: 'image' | 'audio') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (res.ok && data.url) {
      setQuestionData(prev => ({
        ...prev,
        media: {
          ...prev.media,
          [type]: data.url,
        },
      }));
      toast.success(`${type} uploaded`);
    } else {
      toast.error('Upload failed');
    }
  };

  const handleSave = async () => {
    const res = await fetch(`/api/admin/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionData),
    });

    if (res.ok) {
      toast.success('Question updated!');
      router.push('/admin/questions');
    } else {
      toast.error('Update failed!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Edit Question</h2>

      <input
        className="w-full border p-2 mb-4"
        placeholder="Heading"
        value={questionData.heading}
        onChange={(e) => setQuestionData({ ...questionData, heading: e.target.value })}
      />

      <div className="flex gap-4 mb-4">
        {['single', 'multi'].map((type) => (
          <button
            key={type}
            className={`px-4 py-1 rounded ${questionData.type === type ? 'bg-black text-white' : 'bg-white border'}`}
            onClick={() => setQuestionData({ ...questionData, type })}
          >
            {type}
          </button>
        ))}
      </div>

      <textarea
        className="w-full border p-2 mb-4"
        placeholder="Enter your question..."
        value={questionData.question}
        onChange={(e) => setQuestionData({ ...questionData, question: e.target.value })}
      />

      <label className="font-medium">Options</label>
      {questionData.options.map((opt, idx) => (
        <div key={idx} className="flex items-center gap-2 mb-2">
          <input
            className="w-full border p-2"
            value={opt}
            onChange={(e) => handleOptionChange(idx, e.target.value)}
          />
          <button onClick={() => handleRemoveOption(idx)} className="text-red-500">🗑️</button>
        </div>
      ))}
      <button onClick={handleAddOption} className="text-blue-600 mb-4">+ Add Option</button>

      <input
        className="w-full border p-2 mb-4"
        placeholder="Correct Answer"
        value={questionData.correctAnswer}
        onChange={(e) => setQuestionData({ ...questionData, correctAnswer: e.target.value })}
      />

      <textarea
        className="w-full border p-2 mb-4"
        placeholder="Explanation"
        value={questionData.explanation}
        onChange={(e) => setQuestionData({ ...questionData, explanation: e.target.value })}
      />

      {/* Media Upload */}
      <div className="mb-4">
        <label className="font-medium">Upload Image or Audio</label>
        <input
          type="file"
          accept="image/*,audio/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              const file = e.target.files[0];
              const type = file.type.startsWith('image') ? 'image' : 'audio';
              handleMediaUpload(file, type);
            }
          }}
        />
      </div>

      {/* Previews */}
      {questionData.media.image && (
        <div className="mb-2">
          <p className="text-sm">Image Preview:</p>
          <img src={questionData.media.image} alt="Preview" className="w-32 rounded" />
        </div>
      )}

      {questionData.media.audio && (
        <div className="mb-2">
          <p className="text-sm">Audio Preview:</p>
          <audio controls className="mt-1">
            <source src={questionData.media.audio} />
            Your browser does not support audio.
          </audio>
        </div>
      )}

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