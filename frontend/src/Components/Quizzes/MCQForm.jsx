import { useState } from "react";

export default function MCQForm({ mcQuestions, setMCQuestions }) {
    const [questionText, setQuestionText] = useState("");
    const [choices, setChoices] = useState(["", "", "", ""]);
    const [correct, setCorrect] = useState("A");

    const addQuestion = () => {
        if (!questionText.trim() || choices.some((c) => !c.trim())) return;

        const newQuestion = {
            text: questionText,
            choices: [...choices],
            correctIndex: correct.charCodeAt(0) - 65,
        };

        setMCQuestions([...mcQuestions, newQuestion]);

        setQuestionText("");
        setChoices(["", "", "", ""]);
        setCorrect("A");
    };

    return (
        <div className="bg-white/80 p-8 rounded-xl w-full max-w-7xl shadow flex gap-10 border border-gray-300/40">
            {/* LEFT SIDE – ADDED QUESTIONS */}
            <div className="w-1/2 pr-4 border-r border-gray-400/40">
                {mcQuestions.length > 0 ? (
                    <>
                        <p className="text-2xl font-bold mb-4">
                            Added Questions
                        </p>

                        <div className="max-h-[450px] overflow-y-auto pr-3 mb-2 grid grid-cols-2 gap-4">
                            {mcQuestions.map((q, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 rounded-lg bg-gray-100/90 shadow-sm w-full flex flex-col"
                                >
                                    {/* Question */}
                                    <p className="font-semibold mb-2 break-words">
                                        Q{idx + 1}: {q.text}
                                    </p>

                                    {/* Choices */}
                                    <ul className="ml-5 max-h-24 overflow-y-auto">
                                        {q.choices.map((c, cIdx) => (
                                            <li
                                                key={cIdx}
                                                className={`${
                                                    cIdx === q.correctIndex
                                                        ? "font-bold text-green-700"
                                                        : "text-gray-800"
                                                } break-words`}
                                            >
                                                {String.fromCharCode(65 + cIdx)}
                                                . {c}
                                            </li>
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

                <label className="font-medium">Choices:</label>
                <div className="flex flex-col gap-2 mb-4">
                    {choices.map((choice, index) => (
                        <input
                            key={index}
                            className="border px-3 py-2 rounded focus:ring-2 focus:ring-[#212832]"
                            placeholder={`Choice ${String.fromCharCode(
                                65 + index
                            )}`}
                            value={choice}
                            onChange={(e) => {
                                const updated = [...choices];
                                updated[index] = e.target.value;
                                setChoices(updated);
                            }}
                        />
                    ))}
                </div>

                <label className="font-medium mb-1">Correct Answer:</label>
                <select
                    value={correct}
                    onChange={(e) => setCorrect(e.target.value)}
                    className="w-full border px-3 py-2 rounded mb-6 focus:ring-2 focus:ring-[#212832]"
                >
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                    <option>D</option>
                </select>

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
