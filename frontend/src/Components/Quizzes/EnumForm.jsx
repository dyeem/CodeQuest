import { useState } from "react";
import { PlusCircle, Trash2, Send, List } from "lucide-react";

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
        <div className="bg-[#1c1917] p-8 rounded-sm w-full max-w-7xl shadow-2xl flex flex-col lg:flex-row gap-10 border-2 border-[#44403c] relative overflow-hidden">
            
            {/* LEFT SIDE – ADDED QUESTIONS */}
            <div className="w-full lg:w-1/2 pr-0 lg:pr-8 border-b lg:border-b-0 lg:border-r border-[#44403c] pb-8 lg:pb-0">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-2xl font-bold text-[#d4af37] tracking-widest uppercase italic">
                        Enumeration Questions
                    </p>
                    <span className="bg-[#0c0a09] px-3 py-1 text-xs text-[#a8a29e] border border-[#292524] rounded-full">
                        {enumQuestions.length} Total
                    </span>
                </div>

                {enumQuestions.length > 0 ? (
                    <div className="flex flex-col gap-6">
                        <div className="max-h-[450px] overflow-y-auto pr-3 mb-2 flex flex-col gap-4 custom-scrollbar">
                            {enumQuestions.map((q, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-sm bg-[#0c0a09] border border-[#292524] shadow-inner"
                                >
                                    <p className="font-bold text-[#e7e5e4] mb-3 flex gap-3 italic">
                                        <span className="text-[#d4af37]">Q{idx + 1}.</span>
                                        {q.text}
                                    </p>
                                    <ul className="text-xs ml-8 space-y-1 text-[#a8a29e] list-disc marker:text-[#d4af37]">
                                        {q.answers.map((a, aIdx) => (
                                            <li key={aIdx}>{a}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <button className="flex items-center justify-center gap-2 mt-6 px-6 py-4 bg-[#2c241b] text-[#d4af37] font-bold uppercase tracking-[0.2em] rounded border border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-[#1c1917] transition-all duration-300 w-full shadow-lg">
                            <Send size={18} />
                            Save All Questions
                        </button>
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
                        <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest">Question Text</label>
                        <input
                            className="w-full bg-[#0c0a09] border border-[#44403c] px-4 py-3 rounded text-[#e7e5e4] focus:border-[#d4af37] focus:outline-none transition-all placeholder-[#44403c] italic"
                            placeholder="Enter question here..."
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest">Answer List</label>
                        <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {answers.map((a, idx) => (
                                <div key={idx} className="flex gap-2 relative">
                                    <span className="absolute left-3 top-3 text-[#d4af37] font-bold text-[10px]">{idx + 1}</span>
                                    <input
                                        className="w-full bg-[#0c0a09] border border-[#44403c] pl-8 pr-10 py-3 rounded text-[#e7e5e4] focus:border-[#d4af37] focus:outline-none transition-all text-sm"
                                        placeholder={`Item ${idx + 1}...`}
                                        value={a}
                                        onChange={(e) => updateAnswer(idx, e.target.value)}
                                    />
                                    {answers.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeAnswer(idx)}
                                            className="absolute right-2 top-2 p-1 text-[#7f1d1d] hover:text-[#ef4444] transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addAnswer}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0c0a09] border border-dashed border-[#44403c] text-[#a8a29e] hover:border-[#d4af37] hover:text-[#d4af37] transition-all text-xs uppercase tracking-widest mt-2"
                        >
                            <PlusCircle size={14} />
                            Add Item
                        </button>
                    </div>

                    <button
                        onClick={addQuestion}
                        className="flex items-center justify-center gap-2 mt-4 px-6 py-4 bg-[#0c0a09] text-[#d4af37] font-bold uppercase tracking-[0.2em] rounded border border-[#292524] hover:bg-[#2c241b] transition-all duration-300 w-full"
                    >
                        Add Question
                    </button>
                </div>
            </div>
        </div>
    );
}