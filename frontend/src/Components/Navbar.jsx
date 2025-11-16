import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
    const location = useLocation();

    const isActive = (path) =>
        location.pathname === path
            ? "border-b-2 border-black pb-1"
            : "hover:text-gray-800";

    return (
        <nav className="absolute w-full bg-transparent text-black font-semibold font-rajdhani">
            <div className="flex items-center h-14 px-6">

                <Link
                    className="text-4xl font-bold" 
                    to="/admin/dashboard">
                    JS CodeQuest
                </Link>

                <div className="ml-auto flex items-center space-x-6 text-xl font-semibold">

                    <Link 
                        to="/admin/dashboard"
                        className={`transition ${isActive("/admin/dashboard")}`}
                    >
                        Dashboard
                    </Link>

                    <Link 
                        to="/admin/student-management"
                        className={`transition ${isActive("/admin/student-management")}`}
                    >
                        Student Management
                    </Link>

                    <Link 
                        to="/admin/assignment-and-challenges"
                        className={`transition ${isActive("/admin/assignment-and-challenges")}`}
                    >
                        Assignments & Challenges
                    </Link>
                </div>
            </div>
        </nav>
    );
}
