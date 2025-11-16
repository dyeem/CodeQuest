import { useEffect, useState } from "react";
import bg from "../assets/assignmentandchallenges.png";
import Coding from "../Components/Challenge/Coding";
import Quiz from "../Components/Challenge/Quiz";
import Debug from "../Components/Challenge/Debug";

export default function AssignmentandChallenges() {
    useEffect(() => {
        document.title = "Assignment and Challenges | CodeQuest";
    }, []);

    const [challengeType, setChallengeType] = useState("");
    
    return (
        <>
            <div
                className="font-rajdhani min-h-screen w-full flex  tracking-wide justify-center bg-fixed"
                style={{
                    backgroundImage: `url(${bg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="w-full flex flex-col items-center ">
                    <div className="mt-14 w-full flex flex-col items-center ">
                        <div className="bg-[#212832] w-full px-50 py-8 flex flex-col items-center justify-center">
                            <div className="flex flex-col items-center gap-2 text-white">
                                <p className="text-5xl font-semibold ">
                                    Assignments and Challenges
                                </p>
                                <p className="text-base font-medium">
                                    Create your Customize Quiz and Challenges for
                                    your Students
                                </p>
                            </div>
                        </div>
                        <div className="mt-2 bg-white/70 flex items-center py-8 w-full">
                            <form action="" method="post" className="flex flex-col items-center w-full">
                                <p className="text-4xl font-semibold text-center mb-4">
                                    Create New Quiz or Challenge
                                </p>
                                <div className="flex flex-col items-center gap-3 text-xl w-full max-w-4xl">
                                    {/* Title + Difficulty */}
                                    <div className="flex justify-between w-full gap-24">
                                        <div className="flex flex-col w-1/2 items-center">
                                            <label className="mb-1 font-medium ">
                                                Challenge Title:
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter Title"
                                                required
                                                className="w-full px-4 py-1 rounded-lg bg-white border border-gray-800/60 text-lg focus:outline-none focus:ring-2 focus:ring-[#212832]"
                                            />
                                        </div>
                                        <div className="flex flex-col w-1/2 items-center">
                                            <label className="mb-1 font-medium">
                                                Difficulty Level:
                                            </label>
                                            <select className="w-full px-4 py-1 rounded-lg bg-white border border-gray-800/60 text-lg focus:outline-none focus:ring-2 focus:ring-[#212832]">
                                                <option value="">Select Difficulty</option>
                                                <option value="">Easy</option>
                                                <option value="">Medium</option>
                                                <option value="">Hard</option>
                                            </select>
                                        </div>
                                    </div>
                                    {/* Section + Due Date */}
                                    <div className="flex justify-between w-full gap-24 px-40">
                                        <div className="flex flex-col w-1/2 items-center">
                                            <label className="mb-1 font-medium">
                                                Class Section:
                                            </label>
                                            <select className="w-full px-4 py-1 rounded-lg bg-white border border-gray-800/60 text-lg focus:outline-none focus:ring-2 focus:ring-[#212832]">
                                                <option value="">Select Section</option>
                                                <option value="">A</option>
                                                <option value="">B</option>
                                                <option value="">C</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col w-1/2 items-center">
                                            <label className="mb-1 font-medium">
                                                Due Date:
                                            </label>
                                            <input
                                                type="date"
                                                className="w-full px-4 py-1 rounded-lg bg-white border border-gray-800/60 text-lg focus:outline-none focus:ring-2 focus:ring-[#212832]"
                                            />
                                        </div>
                                    </div>
                                    {/* Type of Challenge */}
                                    <div className="flex flex-col w-1/2 items-center px-30">
                                        <label className="mb-1 font-medium">
                                            Type of Challenge:
                                        </label>
                                        <select
                                            value={challengeType}
                                            onChange={(e) => setChallengeType(e.target.value)}
                                            className="w-full px-4 py-1 rounded-lg bg-white border border-gray-800/60 text-lg focus:outline-none focus:ring-2 focus:ring-[#212832]"
                                        >
                                            <option value="">Select Quiz Type</option>
                                            <option value="quiz">Quiz Type</option>
                                            <option value="debug">Debug Type</option>
                                            <option value="coding">Coding Type</option>
                                        </select>

                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    {challengeType === "quiz" && <Quiz/>}
                    {challengeType === "coding" && <Coding/>}
                    {challengeType === "debug" && <Debug/>}
                </div>
            </div>
        </>
    );
}
