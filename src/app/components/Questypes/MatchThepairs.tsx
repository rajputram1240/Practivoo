import React, { useState, useEffect } from "react";
import { Check, Trash2, Plus, ReplaceIcon } from "lucide-react";
import { QuesAnsComponentsProps } from "../QuesAnsComponent";
import { matchThePairs } from "@/app/admin/questions/create/page";

type MatchThePairsProps = Omit<QuesAnsComponentsProps, "activeQuesType">;

const MatchThePairs = ({
  current,
  activeIndex,
  updateCurrent,
  addOption,
  updateOption,
  setAsCorrectAnswer,
  removeOption,
  handlePairUpload,
}: MatchThePairsProps) => {
  const [mode, setMode] = useState<"picture" | "word" | null>(null);

  const [pairs, setPairs] = useState<matchThePairs[]>([{ key: "", value: "" }]);

  //  Sync pairs with current.matchThePairs whenever it changes
  useEffect(() => {
    if (current.questiontype === "Match The Pairs") {
      if (current.matchThePairs && current.matchThePairs.length > 0) {
        setPairs(current.matchThePairs); // load saved ones
      } else {
        const starter = [{ key: "", value: "" }];
        setPairs(starter);
        updateCurrent({ matchThePairs: starter });
      }
    }
  }, [current.questiontype, current.matchThePairs]);

  const addPair = () => {
    const newPairs = [...pairs, { key: "", value: "" }];
    setPairs(newPairs);
    updateCurrent({ matchThePairs: newPairs });
  };

  const updatePair = (
    idx: number,
    field: "key" | "value",
    value: string | File
  ) => {
    const updated = [...pairs];
    if (field === "key") updated[idx].key = typeof value === "string" ? value : "";
    else updated[idx].value = value as string;

    setPairs(updated);
    updateCurrent({ matchThePairs: updated });
  };

  const removePair = (idx: number) => {
    const updated = pairs.filter((_, i) => i !== idx);
    setPairs(updated);
    updateCurrent({ matchThePairs: updated });
  };

  return (
    <div className="space-y-6">
      {/* Question Input */}
      <div>
        <label className="font-semibold">Question</label>
        <textarea
          placeholder="eg. Match the pairs"
          className="w-full border p-2 rounded-lg"
          value={current.question}
          onChange={(e) => updateCurrent({ question: e.target.value })}
        />

        <div className="w-full border border-black border-dashed rounded-lg p-5 mt-3">
          {mode === "word" ? (
            <>
              <div className="flex justify-around">
                <h2 className="font-medium">Column A (Question)</h2>
                <h2 className="font-medium">Column B (Answer)</h2>
              </div>

              {(pairs.length > 0 ? pairs : current.matchThePairs || []).map(
                (pair, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row items-center gap-4 relative border p-3 rounded-lg"
                  >
                    <input
                      type="text"
                      placeholder="Enter key"
                      className="border w-full h-[45px] px-2 rounded-lg"
                      value={pair.key}
                      onChange={(e) => updatePair(idx, "key", e.target.value)}
                    />

                    <input
                      type="text"
                      placeholder="Enter value"
                      className="border w-full h-[45px] px-2 rounded-lg"
                      value={pair.value}
                      onChange={(e) => updatePair(idx, "value", e.target.value)}
                    />

                    <Trash2
                      onClick={() => removePair(idx)}
                      className="absolute top-2 right-2 cursor-pointer text-red-500"
                    />
                  </div>
                )
              )}

              <button
                onClick={addPair}
                type="button"
                className="flex items-center gap-2 text-blue-600 mt-2"
              >
                <Plus size={18} /> Add Pair
              </button>
            </>
          ) : mode === "picture" ? (
            <>
              <div className="flex justify-around">
                <h2 className="font-medium">Column A (Image)</h2>
                <h2 className="font-medium">Column B (Answer)</h2>
              </div>

              {(pairs.length > 0 ? pairs : current.matchThePairs || []).map(
                (pair, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row items-center gap-4 relative border p-3 rounded-lg"
                  >
                    <div className=" w-full relative">
                     {/*  {pair.key && (<div className="absolute z-10  bg-white rounded-lg px-2 py-1 flex  gap-2 right-1 top-1 cursor-pointer text-blue-500">
                        <ReplaceIcon />
                        <span> Replace</span>
                      </div>)} */}

                      <input
                        id={`file-input-${activeIndex}-${idx}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            const file = e.target.files[0];
                            const previewUrl = URL.createObjectURL(file);
                            updatePair(idx, "key", previewUrl);

                            handlePairUpload?.(file, pair.value, activeIndex, idx);
                          }
                        }}
                      />
                      <label
                        htmlFor={`file-input-${activeIndex}-${idx}`}
                        className="border h-[150px] flex items-center justify-center text-gray-500 cursor-pointer rounded-lg w-full overflow-hidden"
                      >

                        {pair.key ? (
                          <img
                            src={pair.key}
                            alt="preview"
                            className="object-cover h- w-full rounded-lg"
                          />
                        ) : (
                          "Upload image"
                        )}
                      </label>
                    </div>

                    <input
                      type="text"
                      placeholder="Enter value"
                      className="border w-full h-[45px] px-2 rounded-lg"
                      value={pair.value}
                      onChange={(e) => updatePair(idx, "value", e.target.value)}
                    />

                    <Trash2
                      onClick={() => removePair(idx)}
                      className="absolute top-2 right-2 cursor-pointer text-red-500"
                    />
                  </div>
                )
              )}

              <button
                onClick={addPair}
                type="button"
                className="flex items-center gap-2 text-blue-600 mt-2"
              >
                <Plus size={18} /> Add Pair
              </button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-medium">Select One</h2>
              <div className="flex justify-center gap-4">
                <div
                  onClick={() => setMode("picture")}
                  className="flex justify-center items-center border-2 border-black rounded-lg px-4 py-2 cursor-pointer"
                >
                  Picture & Words
                </div>
                <span>Or</span>
                <div
                  onClick={() => setMode("word")}
                  className="flex justify-center items-center border-2 border-black rounded-lg px-4 py-2 cursor-pointer"
                >
                  Words & Words
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchThePairs;
