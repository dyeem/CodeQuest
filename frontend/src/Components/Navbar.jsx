import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase.config.js"; // ✅ import auth

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    location.pathname === path
      ? "border-b-2 border-black pb-1"
      : "hover:text-gray-800";

  const handleLogout = async () => {
    try {
      await signOut(auth);       // Logs out Firebase user
      navigate("/admin/auth/login");        // Redirect to login page
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="absolute w-full bg-transparent text-black font-semibold font-rajdhani">
      <div className="flex items-center h-14 px-6">
        <Link className="text-4xl font-bold" to="/admin/dashboard">
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

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="transition bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
