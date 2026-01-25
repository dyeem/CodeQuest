import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function Coding() {
    const [codingChallenge, setCodingChallenge] = useState("");
    return (
        <div className="w-full flex flex-col items-center my-6 animate-fade-in">
            <p className="text-3xl font-bold mb-6 text-[#d4af37] tracking-[0.2em] uppercase underline underline-offset-8 decoration-[#44403c]">
                Coding Challenge
            </p>

            <div className="w-full max-w-2xl bg-[#1c1917] p-8 rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col gap-6 border-2 border-[#44403c] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent"></div>
                
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-[#a8a29e] uppercase tracking-widest text-xs flex items-center gap-2">
                        <Sparkles size={14} className="text-[#d4af37]" />
                        Challenge Instruction
                    </label>
                    <textarea
                        rows={4}
                        placeholder="e.g., Create a function that adds two numbers..."
                        className="w-full bg-[#0c0a09] border border-[#44403c] px-4 py-3 rounded text-[#e7e5e4] focus:ring-1 focus:ring-[#d4af37] focus:outline-none transition-all placeholder-[#44403c] font-serif italic"
                        value={codingChallenge}
                        onChange={(e) => setCodingChallenge(e.target.value)}
                    />
                </div>

                <button className="mt-4 px-6 py-4 bg-[#2c241b] text-[#d4af37] font-bold uppercase tracking-[0.2em] rounded border border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-[#1c1917] transition-all duration-300 shadow-lg shadow-[#000]/40">
                    Create Challenge
                </button>
            </div>
        </div>
    )
}