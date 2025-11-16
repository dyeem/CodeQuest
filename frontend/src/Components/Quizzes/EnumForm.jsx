import { useState } from "react";

export default function EnumForm({ enumQuestions, setEnumQuestions }) {
    const [questionText, setQuestionText] = useState("");
    const [answers, setAnswers] = useState([""]);

    const addAnswer = () => setAnswers([...answers, ""]);
    const updateAnswer = (index, value) => {
        const updated = [...answers];
        updated[index] = value;
        setAnswers(updated);
    };
    const removeAnswer = (index) => {
        const updated = answers.filter((_, i) => i !== index);
        setAnswers(updated);
    };

    const addQuestion = () => {
        if (!questionText.trim() || answers.some(a => !a.trim())) return;

        const newQuestion = {
            text: questionText,
            answers,
        };

        setEnumQuestions([...enumQuestions, newQuestion]);

        setQuestionText("");
        setAnswers([""]);
    };

    return (
        <div className="bg-white/80 p-6 rounded-xl w-full max-w-7xl shadow flex gap-6 border border-gray-300/40">
            
            {/* LEFT SIDE – ADDED QUESTIONS */}
            <div className="w-1/2 pr-4 border-r border-gray-400/40">
                {enumQuestions.length > 0 ? (
                    <>
                        <p className="text-2xl font-bold mb-4">Added Questions</p>
                        <div className="max-h-[450px] overflow-y-auto pr-3 mb-2 flex flex-col gap-4">
                            {enumQuestions.map((q, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 rounded-lg bg-gray-100/90 shadow-sm w-full flex flex-col overflow-hidden"
                                >
                                    <p className="font-semibold mb-2 line-clamp-3">
                                        Q{idx + 1}: {q.text}
                                    </p>
                                    <ul className="text-sm ml-5">
                                        {q.answers.map((a, aIdx) => (
                                            <li key={aIdx}>{String.fromCharCode(65 + aIdx)}. {a}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <button className="mt-6 px-4 py-2 bg-[#212832] text-white rounded-lg hover:bg-[#2b333f] w-full">
                            Submit All Questions
                        </button>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-600 italic">
                        No questions added yet.
                    </div>
                )}
            </div>

            {/* RIGHT SIDE – ADD NEW QUESTION */}
            <div className="w-1/2">
                <p className="text-2xl font-semibold mb-4">Add New Question</p>

                <label className="font-medium">Question:</label>
                <input
                    className="w-full border px-3 py-2 rounded mb-4 focus:ring-2 focus:ring-[#212832]"
                    placeholder="Enter question"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                />

                <label className="font-medium mb-2">Answers:</label>
                <div className="flex flex-col gap-2 mb-4">
                    {answers.map((a, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-[#212832]"
                                placeholder={`Answer ${String.fromCharCode(65 + idx)}`}
                                value={a}
                                onChange={(e) => updateAnswer(idx, e.target.value)}
                            />
                            {answers.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeAnswer(idx)}
                                    className="bg-red-500 text-white px-2 rounded hover:bg-red-600"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addAnswer}
                        className="bg-[#212832] text-white px-4 py-2 rounded hover:bg-[#161c22] w-full"
                    >
                        Add Answer
                    </button>
                </div>

                <button
                    onClick={addQuestion}
                    className="bg-[#212832] text-white px-4 py-2 rounded-lg w-full hover:bg-[#161c22]"
                >
                    Add Question
                </button>
            </div>
        </div>
    );
}
