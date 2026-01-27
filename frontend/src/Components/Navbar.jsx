import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase.config.js";
import { LayoutDashboard, Users, FileText, LogOut, Code, Scroll, Shield } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    location.pathname === path
      ? "bg-[#2c241b] text-[#e8dcc0] border-l-4 border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.2)]"
      : "text-[#8b8b8b] hover:text-[#d4c5a0] hover:bg-[#2c241b]/50";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <aside className="h-screen w-64 bg-[#0f0c08] text-[#a8a29e] flex flex-col shadow-2xl fixed left-0 top-0 overflow-y-auto font-serif z-50 border-r border-[#292524]">
      {/* Ancient Header */}
      <div className="p-6 border-b border-[#292524] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        <Link to="/admin/dashboard" className="flex items-center gap-3 text-2xl font-bold tracking-widest text-[#d4af37]">
           <Scroll size={32} className="text-[#d4af37]" />
           <span className="uppercase drop-shadow-sm">CodeQuest</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-8 space-y-4">
        <SidebarLink 
          to="/dashboard" 
          icon={<LayoutDashboard size={20} />} 
          label="Dashboard" 
          activeClass={isActive("/dashboard")}
        />
        <SidebarLink 
          to="/student-management" 
          icon={<Users size={20} />} 
          label="Students" 
          activeClass={isActive("/student-management")}
        />
        <SidebarLink 
          to="/assignment-and-challenges" 
          icon={<FileText size={20} />} 
          label="Assignments & Challenges" 
          activeClass={isActive("/assignment-and-challenges")}
        />
        <SidebarLink 
          to="/user-management" 
          icon={<Shield size={20} />} 
          label="User Management" 
          activeClass={isActive("/user-management")}
        />
        <SidebarLink 
          to="/profile" 
          icon={<Users size={20} />} 
          label="Profile" 
          activeClass={isActive("/profile")}
        />
      </nav>

      <div className="p-4 border-t border-[#292524] bg-[#0c0a09]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-[#7f1d1d] hover:text-[#ef4444] hover:bg-[#7f1d1d]/10 rounded border border-transparent hover:border-[#7f1d1d]/30 transition-all duration-300 group"
        >
          <LogOut size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-medium tracking-wide uppercase text-sm">LOGOUT</span>
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ to, icon, label, activeClass }) {
    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 font-medium tracking-wide ${activeClass}`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    )
}
