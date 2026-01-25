import { useState } from "react";
import { PlusCircle, Send, Feather } from "lucide-react";

export default function ParagraphForm({ paragraphQuestions, setParagraphQuestions }) {
    const [questionText, setQuestionText] = useState("");

    const addQuestion = () => {
        if (!questionText.trim()) return;

        const newQuestion = { text: questionText };
        setParagraphQuestions([...paragraphQuestions, newQuestion]);
        setQuestionText("");
    };

    return (
        <div className="bg-[#1c1917] p-8 rounded-sm w-full max-w-7xl shadow-2xl flex flex-col lg:flex-row gap-10 border-2 border-[#44403c] relative overflow-hidden">

            {/* LEFT SIDE – ADDED QUESTIONS */}
            <div className="w-full lg:w-1/2 pr-0 lg:pr-8 border-b lg:border-b-0 lg:border-r border-[#44403c] pb-8 lg:pb-0">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-2xl font-bold text-[#d4af37] tracking-widest uppercase italic">
                        Paragraph Questions
                    </p>
                    <span className="bg-[#0c0a09] px-3 py-1 text-xs text-[#a8a29e] border border-[#292524] rounded-full">
                        {paragraphQuestions.length} Total
                    </span>
                </div>

                {paragraphQuestions.length > 0 ? (
                    <div className="flex flex-col gap-6">
                        <div className="max-h-[500px] overflow-y-auto pr-3 space-y-4 custom-scrollbar">
                            {paragraphQuestions.map((q, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-sm bg-[#0c0a09] border border-[#292524] shadow-inner"
                                >
                                    <p className="font-bold text-[#e7e5e4] mb-2 flex gap-3 italic">
                                        <span className="text-[#d4af37]">Question {idx + 1}.</span>
                                    </p>
                                    <p className="text-[#a8a29e] text-sm leading-relaxed indent-4">
                                        {q.text}
                                    </p>
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
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest flex items-center gap-2">
                             <Feather size={14} className="text-[#d4af37]"/>
                             Question Text
                        </label>
                        <textarea
                            className="w-full bg-[#0c0a09] border border-[#44403c] px-4 py-3 rounded text-[#e7e5e4] focus:border-[#d4af37] focus:outline-none transition-all placeholder-[#44403c] italic leading-relaxed"
                            rows={8}
                            placeholder="Enter the paragraph question here..."
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                        />
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