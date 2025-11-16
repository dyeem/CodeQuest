import { useEffect } from "react";
import bg from "../assets/dashboardbg.png";
export default function Dashboard() {
    useEffect(() => {
        document.title = "Dashboard | CodeQuest";
    }, []);
    return (
        <>
          <div className="min-h-screen w-full flex tracking-wide justify-center "style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center",}}>
                <div className="mt-14 w-full">
                    <div className="w-full font-rajdhani mb-6 text-center text-white bg-[#212832] py-9">
                        <p className="font-semibold text-5xl mb-3">Welcome to the Teacher/Admin Dashboard</p>
                        <p className="text-xl italic">Manage Student, Assignments, and report effortlessly</p>
                    </div>
                    <div className="flex items-center justify-center bg-white mx-96">
                        <div className="font-rajdhani text-4xl font-bold text-gray-800">
                            <p>Dashboard Overview</p>
                        </div>
                        <div className="">

                        </div>
                    </div>
                </div>
          </div>
        </>
    )
}