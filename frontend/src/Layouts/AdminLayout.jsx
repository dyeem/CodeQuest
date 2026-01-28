import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar"; 
import Footer from "../Components/Footer";
import { ToastProvider } from "../context/ToastContext";
import { Menu } from "lucide-react";

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <ToastProvider>
            <div className="flex min-h-screen bg-[#0f0c08] relative">
                {/* Mobile Header */}
                <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0c0a09] border-b border-[#292524] flex items-center px-4 z-40 justify-between">
                    <span className="text-[#d4af37] font-bold tracking-widest uppercase">CodeQuest</span>
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-[#a8a29e] hover:text-[#d4af37] transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                {/* Sidebar */}
                <Navbar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} /> 
                
                {/* Main Content Area */}
                <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-0' : 'ml-0 md:ml-64'} pt-16 md:pt-0`}>
                    <main className="flex-1 overflow-x-hidden bg-[#1c1917]">
                        <Outlet />
                    </main>
                </div>
            </div>
        </ToastProvider>
    )
}