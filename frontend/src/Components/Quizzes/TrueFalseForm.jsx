import { useState } from "react";

export default function TrueFalseForm({
    truefalseQuestions,
    setTrueFalseQuestions,
}) {
    const [questionText, setQuestionText] = useState("");
    const [correct, setCorrect] = useState("True");

    const addQuestion = () => {
        if (!questionText.trim()) return;

        const newQuestion = {
            text: questionText,
            correctAnswer: correct,
        };

        setTrueFalseQuestions([...truefalseQuestions, newQuestion]);
        setQuestionText("");
        setCorrect("True");
    };

    return (
        <div className="bg-white/80 p-6 rounded-xl w-full max-w-7xl shadow flex gap-6 border border-gray-300/40">
            {/* LEFT SIDE – ADDED QUESTIONS */}
            <div className="w-1/2 pr-4 border-r border-gray-400/40 max-h-[450px] overflow-y-auto">
                {truefalseQuestions.length > 0 ? (
                    <>
                        <p className="text-2xl font-bold mb-4">
                            Added True/False Questions
                        </p>
                        <div className="max-h-[450px] overflow-y-auto pr-3 mb-2 grid grid-cols-2 gap-4">
                            {truefalseQuestions.map((q, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 rounded-lg bg-gray-100/90 shadow-sm flex flex-col"
                                >
                                    <p className="font-semibold mb-2 break-words">
                                        Q{idx + 1}: {q.text}
                                    </p>
                                    <p
                                        className={`font-bold ${
                                            q.correctAnswer === "True"
                                                ? "text-green-700"
                                                : "text-red-700"
                                        }`}
                                    >
                                        Correct Answer: {q.correctAnswer}
                                    </p>
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

                <label className="font-medium mb-1">Statement:</label>
                <input
                    className="w-full border px-3 py-2 rounded mb-4 focus:ring-2 focus:ring-[#212832]"
                    placeholder="Enter statement"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                />

                <label className="font-medium mb-1">Correct Answer:</label>
                <select
                    value={correct}
                    onChange={(e) => setCorrect(e.target.value)}
                    className="w-full border px-3 py-2 rounded mb-4 focus:ring-2 focus:ring-[#212832]"
                >
                    <option>True</option>
                    <option>False</option>
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
