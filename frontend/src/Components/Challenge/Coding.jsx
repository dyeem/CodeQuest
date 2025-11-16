import { useState } from 'react';

export default function Coding() {
    const [codingChallenge, setCodingChallenge] = useState("");
    return (
        <>
            <div className="w-full flex flex-col items-center my-6">
                <p className="text-3xl font-semibold mb-4">Create a Coding Challenge</p>

                <div className="w-full max-w-2xl bg-white/80 p-6 rounded-xl shadow flex flex-col gap-4 border border-gray-300/40">
                    <label className="font-medium">Coding Challenge:</label>
                    <input
                        type="text"
                        placeholder="e.g., Create a program that will add 2 numbers"
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-[#212832]"
                        value={codingChallenge}
                        onChange={(e) => setCodingChallenge(e.target.value)}
                    />
                    <div className="">
                        <button className="mt-6 px-4 py-2 bg-[#212832] text-white rounded-lg hover:bg-[#2b333f] w-full">
                            Create Challenge
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}