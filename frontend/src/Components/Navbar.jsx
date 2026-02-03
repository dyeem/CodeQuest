import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../config/firebase.config.js";
import { LayoutDashboard, Users, FileText, LogOut, Code, Scroll, Shield, User, X, MessageSquare } from "lucide-react";
import useAuth from "../hooks/auth";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [adminData, setAdminData] = useState(null);

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

  useEffect(() => {
    if (admin?.uid) {
        const q = query(collection(db, "admins"), where("uid", "==", admin.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setAdminData(snapshot.docs[0].data());
            } else {
                // Fallback if no firestore doc, try to use auth data
                setAdminData({
                    firstName: admin.displayName || "Admin",
                    lastName: "",
                    email: admin.email,
                    photoURL: admin.photoURL
                });
            }
        });
        return () => unsubscribe();
    }
  }, [admin]);

  return (
    <>
        {/* Mobile Overlay */}
        {isOpen && (
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
                onClick={onClose}
            ></div>
        )}

        <aside className={`h-screen w-64 bg-[#0f0c08] text-[#a8a29e] flex flex-col shadow-2xl fixed left-0 top-0 overflow-y-auto font-serif z-50 border-r border-[#292524] transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Ancient Header */}
        <div className="p-6 border-b border-[#292524] relative overflow-hidden group flex justify-between items-center">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <Link to="/admin/dashboard" className="flex items-center gap-3 text-2xl font-bold tracking-widest text-[#d4af37]">
            <Scroll size={32} className="text-[#d4af37]" />
            <span className="uppercase drop-shadow-sm">CodeQuest</span>
            </Link>
            {/* Close Button for Mobile */}
            <button onClick={onClose} className="md:hidden text-[#a8a29e] hover:text-[#ef4444]">
                <X size={24} />
            </button>
        </div>

        <nav className="flex-1 px-3 py-8 space-y-4">
            <SidebarLink 
            to="/dashboard" 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            activeClass={isActive("/dashboard")}
            onClick={onClose}
            />
            <SidebarLink 
            to="/student-management" 
            icon={<Users size={20} />} 
            label="Students" 
            activeClass={isActive("/student-management")}
            onClick={onClose}
            />
            <SidebarLink 
            to="/assignment-and-challenges" 
            icon={<FileText size={20} />} 
            label="Assignments & Challenges" 
            activeClass={isActive("/assignment-and-challenges")}
            onClick={onClose}
            />
            <SidebarLink 
            to="/user-management" 
            icon={<Shield size={20} />} 
            label="User Management" 
            activeClass={isActive("/user-management")}
            onClick={onClose}
            />
            <SidebarLink 
            to="/profile" 
            icon={<User size={20} />} 
            label="Profile" 
            activeClass={isActive("/profile")}
            onClick={onClose}
            />
             <SidebarLink 
            to="/feedback" 
            icon={<MessageSquare size={20} />} 
            label="Feedback" 
            activeClass={isActive("/feedback")}
            onClick={onClose}
            />
        </nav>

        <div className="border-t border-[#292524] bg-[#0c0a09]">
            {/* User Profile Section */}
            {admin && (
                <div className="p-4 flex items-center gap-3 border-b border-[#292524]/50">
                    <div className="h-10 w-10 rounded-full border border-[#44403c] bg-[#1c1917] overflow-hidden flex-shrink-0">
                        {adminData?.photoURL ? (
                            <img src={adminData.photoURL} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-[#57534e]">
                                <User size={20} />
                            </div>
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[#e7e5e4] text-sm font-bold truncate">
                            {adminData ? `${adminData.firstName} ${adminData.lastName}` : "Loading..."}
                        </p>
                        <p className="text-[#57534e] text-xs truncate">{admin.email}</p>
                    </div>
                </div>
            )}

            <div className="p-4">
                <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-[#7f1d1d] hover:text-[#ef4444] hover:bg-[#7f1d1d]/10 rounded border border-transparent hover:border-[#7f1d1d]/30 transition-all duration-300 group"
                >
                <LogOut size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium tracking-wide uppercase text-sm">LOGOUT</span>
                </button>
            </div>
        </div>
        </aside>
    </>
  );
}

function SidebarLink({ to, icon, label, activeClass, onClick }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 font-medium tracking-wide ${activeClass}`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    )
}