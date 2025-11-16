import { useEffect } from 'react';
import bg from "../assets/SMbg.png";
export default function AssignmentandChallenges() {
     useEffect(() => {
        document.title = "Student Management | CodeQuest";
    }, []);
    return (
        <>
            <div className="font-rajdhani min-h-screen w-full flex tracking-wide justify-center "style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center",}}>
                <div className="mt-14 w-full">
                    <div className="w-full font-rajdhani mb-6 text-center text-white bg-[#212832] py-9">
                        <p className="font-semibold text-5xl mb-3">Welcome to the Teacher/Admin Dashboard</p>
                        <p className="text-xl italic">Manage Student, Assignments, and report effortlessly</p>
                    </div>
                </div>
            </div>
        </>
    )
}