import React, { useState, useEffect } from 'react';
import Editor from "@monaco-editor/react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function SubmissionDetailView({ submission, task, onScoreUpdate }) {
    const [questionScores, setQuestionScores] = useState({});

    // Reset scores when student changes
    useEffect(() => {
        setQuestionScores({});
    }, [submission?.student?.uid]);

    // Recalculate total score whenever per-question scores change
    useEffect(() => {
        if (!onScoreUpdate) return;

        let total = 0;
        
        // Add up manual scores
        Object.values(questionScores).forEach(s => total += (Number(s) || 0));

        // Add up auto-graded scores (MCQ/TF) if any
        if (task?.questions && (task.subtype === 'mcq' || task.subtype === 'tf')) {
            const studentAnswers = submission?.answers || submission?.content;
            task.questions.forEach((q, idx) => {
                const rawAnswer = studentAnswers ? studentAnswers[idx] : null;
                let isCorrect = false;
                if (task.subtype === 'mcq') {
                    if (Number(rawAnswer) === Number(q.correctIndex)) isCorrect = true;
                } else if (task.subtype === 'tf') {
                    if (rawAnswer === q.correctAnswer) isCorrect = true;
                }
                
                // Assuming 1 point per auto-graded question for now
                if (isCorrect) total += 1;
            });
        }

        // Only update if total > 0 to avoid overwriting existing score with 0 on load
        // But if user explicitly sets 0, we want that.
        // Better logic: Only call update if questionScores has entries.
        if (Object.keys(questionScores).length > 0) {
             onScoreUpdate(total);
        }
        
    }, [questionScores, task, submission, onScoreUpdate]);

    if (!submission || !task) return null;

    const { type, subtype } = task;
    // 'answers' field from submission (based on previous context fix) or fallback to content if needed
    const studentAnswers = submission.answers || submission.content;

    const handleQuestionScoreChange = (idx, val) => {
        setQuestionScores(prev => ({
            ...prev,
            [idx]: val
        }));
    };

    // --- CASE 1: Coding & Debugging ---
    if (type === 'coding' || type === 'debug') {
        return (
            <div className="space-y-6">
                <div className="bg-[#0c0a09] p-6 rounded border border-[#292524]">
                    <h4 className="text-[#d4af37] font-bold uppercase tracking-widest text-sm mb-4 border-b border-[#292524] pb-2">
                        Instructions
                    </h4>
                    <p className="text-[#e7e5e4] whitespace-pre-wrap font-serif italic text-lg leading-relaxed">
                        {task.instruction}
                    </p>
                </div>
                
                {type === 'debug' && task.code && (
                    <div className="bg-[#0c0a09] p-2 rounded border border-[#292524]">
                        <h4 className="text-[#a8a29e] font-bold uppercase tracking-widest text-xs mb-2 px-2">
                            Initial Code
                        </h4>
                        <Editor
                            height="200px"
                            defaultLanguage="javascript"
                            theme="vs-dark"
                            value={task.code}
                            options={{ readOnly: true, fontSize: 14, fontFamily: 'monospace', minimap: { enabled: false }, scrollBeyondLastLine: false }}
                        />
                    </div>
                )}

                <div className="bg-[#1c1917] p-1 rounded border border-[#292524]">
                    <span className="text-[#57534e] uppercase text-[10px] font-bold block mb-2 px-3 pt-2">Student Code Submission</span>
                    <Editor
                        height="450px"
                        defaultLanguage="javascript"
                        theme="vs-dark"
                        value={submission.codeSubmitted || "// No code submitted"}
                        options={{ readOnly: true, fontSize: 14, fontFamily: 'monospace', minimap: { enabled: false }, scrollBeyondLastLine: false }}
                    />
                </div>
            </div>
        );
    }

    // --- CASE 2: Quizzes ---
    if (type === 'quiz') {
        // Calculate Score for Auto-Graded Types (Display Only)
        let correctCount = 0;
        let totalCount = task.questions?.length || 0;
        const isAutoGradable = subtype === 'mcq' || subtype === 'tf';

        if (isAutoGradable && task.questions) {
            task.questions.forEach((q, idx) => {
                const rawAnswer = studentAnswers ? studentAnswers[idx] : null;
                if (subtype === 'mcq') {
                    if (Number(rawAnswer) === Number(q.correctIndex)) correctCount++;
                } else if (subtype === 'tf') {
                    if (rawAnswer === q.correctAnswer) correctCount++;
                }
            });
        }

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4 bg-[#0c0a09] p-4 rounded border border-[#292524]">
                    <div className="flex items-center gap-2">
                        <span className="bg-[#2c241b] text-[#d4af37] px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border border-[#d4af37]/30">
                            {subtype || "MCQ"}
                        </span>
                        <span className="text-[#57534e] text-xs uppercase tracking-wider font-bold">
                            {totalCount} Questions
                        </span>
                    </div>
                    
                    {isAutoGradable && (
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[10px] text-[#57534e] uppercase font-bold tracking-widest">Auto-Score</p>
                                <p className="text-xl font-bold text-[#e7e5e4] leading-none">
                                    <span className="text-[#d4af37]">{correctCount}</span>
                                    <span className="text-[#57534e]">/{totalCount}</span>
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full border-2 border-[#d4af37] flex items-center justify-center text-[#d4af37] font-bold text-xs bg-[#2c241b]">
                                {Math.round((correctCount / totalCount) * 100)}%
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {task.questions?.map((q, idx) => {
                        // Answer Retrieval Logic
                        const rawAnswer = studentAnswers ? studentAnswers[idx] : null;
                        
                        let isCorrect = false;
                        let studentAnswerDisplay = rawAnswer;
                        let correctAnswerDisplay = "";

                        // -- Logic for MCQ --
                        if (subtype === 'mcq') {
                            // rawAnswer is likely an index (number)
                            const ansIdx = Number(rawAnswer);
                            const correctIdx = Number(q.correctIndex);
                            
                            isCorrect = ansIdx === correctIdx;
                            
                            studentAnswerDisplay = (rawAnswer !== null && q.choices[ansIdx]) ? q.choices[ansIdx] : "(No Answer)";
                            correctAnswerDisplay = q.choices[correctIdx];
                        } 
                        // -- Logic for True/False --
                        else if (subtype === 'tf') {
                            // rawAnswer is likely "True" or "False" string
                            isCorrect = rawAnswer === q.correctAnswer;
                            studentAnswerDisplay = rawAnswer || "(No Answer)";
                            correctAnswerDisplay = q.correctAnswer;
                        }
                        // -- Logic for Enum & Paragraph (Manual Grading) --
                        else {
                            // These are manually graded, so "Correct" badge might not apply or is subjective
                            // We just display the content
                            studentAnswerDisplay = rawAnswer || "(No Answer)";
                        }

                        return (
                            <div key={idx} className="bg-[#1c1917] p-4 rounded border border-[#292524] relative">
                                {/* Auto-Graded Badge */}
                                {(subtype === 'mcq' || subtype === 'tf') && (
                                    <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl border-l border-b ${isCorrect ? "bg-[#052e16] text-[#4ade80] border-[#14532d]" : "bg-[#450a0a] text-[#f87171] border-[#7f1d1d]"}`}>
                                        {isCorrect ? "Correct" : "Incorrect"}
                                    </div>
                                )}

                                {/* Manual Grading Input for Enum/Paragraph */}
                                {(subtype === 'enum' || subtype === 'paragraph') && (
                                    <div className="absolute top-3 right-3 flex items-center gap-2">
                                        <label className="text-[10px] text-[#a8a29e] uppercase font-bold tracking-widest">Score:</label>
                                        <input 
                                            type="number" 
                                            className="w-16 bg-[#0c0a09] border border-[#44403c] p-1 text-center text-[#d4af37] font-bold text-sm focus:border-[#d4af37] outline-none rounded"
                                            value={questionScores[idx] || ""}
                                            onChange={(e) => handleQuestionScoreChange(idx, e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                )}

                                <p className="text-[#e7e5e4] font-bold mb-4 flex gap-2 pr-20 text-lg">
                                    <span className="text-[#d4af37]">Q{idx + 1}.</span> {q.text}
                                </p>
                                
                                <div className="ml-6 space-y-4">
                                    {/* Subtype Specific Display */}
                                    
                                    {/* MCQ & TF: Side-by-Side Comparison */}
                                    {(subtype === 'mcq' || subtype === 'tf') && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-3 bg-[#0c0a09] rounded border border-[#292524]">
                                                <span className="text-[#57534e] uppercase text-[9px] font-bold block mb-1">Correct Answer</span>
                                                <p className="text-[#4ade80] font-bold text-sm">
                                                    {correctAnswerDisplay}
                                                </p>
                                            </div>
                                            <div className={`p-3 rounded border ${isCorrect ? "bg-[#052e16]/20 border-[#4ade80]/30" : "bg-[#450a0a]/20 border-[#f87171]/30"}`}>
                                                <span className="text-[#57534e] uppercase text-[9px] font-bold block mb-1">Student Answer</span>
                                                <p className={`font-bold text-sm ${isCorrect ? "text-[#4ade80]" : "text-[#f87171]"}`}>
                                                    {studentAnswerDisplay}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Enum: List vs List */}
                                    {subtype === 'enum' && (
                                        <div className="space-y-3">
                                            <div className="bg-[#0c0a09] p-3 rounded border border-[#292524]">
                                                <span className="text-[#57534e] uppercase text-[9px] font-bold block mb-2">Accepted Answers</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {q.answers?.map((a, i) => (
                                                        <span key={i} className="px-2 py-1 bg-[#292524] rounded text-[#a8a29e] text-xs border border-[#44403c]">{a}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-[#0c0a09] p-3 rounded border border-[#292524]">
                                                <span className="text-[#57534e] uppercase text-[9px] font-bold block mb-1">Student Response</span>
                                                <p className="text-[#e7e5e4] italic text-sm">{studentAnswerDisplay}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Paragraph: Text Block */}
                                    {subtype === 'paragraph' && (
                                        <div className="bg-[#0c0a09] p-4 rounded border border-[#292524]">
                                            <span className="text-[#57534e] uppercase text-[9px] font-bold block mb-2">Student Response</span>
                                            <p className="text-[#e7e5e4] text-sm whitespace-pre-wrap leading-relaxed">
                                                {studentAnswerDisplay}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return <div className="text-[#57534e]">Unknown task type</div>;
}