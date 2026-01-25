import { useState } from "react";
import { PlusCircle, Send, Trash2 } from "lucide-react";

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

    const removeQuestion = (index) => {
        if (confirm("Remove this question?")) {
            const updated = truefalseQuestions.filter((_, i) => i !== index);
            setTrueFalseQuestions(updated);
        }
    };

    return (
        <div className="bg-[#1c1917] p-8 rounded-sm w-full max-w-7xl shadow-2xl flex flex-col lg:flex-row gap-10 border-2 border-[#44403c] relative overflow-hidden">
             {/* LEFT SIDE – ADDED QUESTIONS */}
             <div className="w-full lg:w-1/2 pr-0 lg:pr-8 border-b lg:border-b-0 lg:border-r border-[#44403c] pb-8 lg:pb-0">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-2xl font-bold text-[#d4af37] tracking-widest uppercase italic">
                        True or False Questions
                    </p>
                    <span className="bg-[#0c0a09] px-3 py-1 text-xs text-[#a8a29e] border border-[#292524] rounded-full">
                        {truefalseQuestions.length} Total
                    </span>
                </div>

                {truefalseQuestions.length > 0 ? (
                    <div className="flex flex-col gap-6">
                        <div className="max-h-[450px] overflow-y-auto pr-3 grid grid-cols-1 gap-4 custom-scrollbar">
                            {truefalseQuestions.map((q, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-sm bg-[#0c0a09] border border-[#292524] shadow-inner group relative"
                                >
                                    <button 
                                        onClick={() => removeQuestion(idx)}
                                        className="absolute top-2 right-2 text-[#7f1d1d] hover:text-[#ef4444] opacity-0 group-hover:opacity-100 transition-all p-1"
                                        title="Remove Question"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <p className="font-bold text-[#e7e5e4] mb-3 leading-relaxed flex gap-3 italic pr-6">
                                        <span className="text-[#d4af37]">Q{idx + 1}.</span>
                                        "{q.text}"
                                    </p>
                                    <p
                                        className={`text-xs font-bold uppercase tracking-widest ${
                                            q.correctAnswer === "True"
                                                ? "text-[#2dd4bf]"
                                                : "text-[#ef4444]"
                                        }`}
                                    >
                                        Answer: {q.correctAnswer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-[#57534e] italic bg-[#0c0a09] rounded border border-dashed border-[#292524]">
                        <p>No questions added yet.</p>
                    </div>
                )}
            </div>

            {/* RIGHT SIDE – ADD NEW QUESTION */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
                <p className="text-2xl font-bold text-[#e7e5e4] tracking-widest uppercase">
                    New Question
                </p>

                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest">Question Statement</label>
                        <textarea
                            className="w-full bg-[#0c0a09] border border-[#44403c] px-4 py-3 rounded text-[#e7e5e4] focus:border-[#d4af37] focus:outline-none transition-all placeholder-[#44403c] italic"
                            rows={4}
                            placeholder="Enter the statement here..."
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest">Correct Answer</label>
                        <select
                            value={correct}
                            onChange={(e) => setCorrect(e.target.value)}
                            className="w-full bg-[#0c0a09] border border-[#44403c] px-4 py-3 rounded text-[#d4af37] font-bold tracking-[0.2em] focus:border-[#d4af37] focus:outline-none appearance-none cursor-pointer"
                        >
                            <option value="True">True</option>
                            <option value="False">False</option>
                        </select>
                    </div>

                    <button
                        onClick={addQuestion}
                        className="flex items-center justify-center gap-2 mt-4 px-6 py-4 bg-[#0c0a09] text-[#a8a29e] font-bold uppercase tracking-[0.2em] rounded border border-[#292524] hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-300 w-full"
                    >
                        <PlusCircle size={18} />
                        Add Question
                    </button>
                </div>
            </div>
        </div>
    );
}