import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar"; 
import Footer from "../Components/Footer";
import { ToastProvider } from "../context/ToastContext";

export default function AdminLayout() {
    return (
        <ToastProvider>
            <div className="flex min-h-screen bg-[#0f0c08]">
                {/* Sidebar (Fixed) */}
                <Navbar /> 
                
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col ml-64 transition-all duration-300">
                    <main className="flex-1 overflow-x-hidden bg-[#1c1917]">
                        <Outlet />
                    </main>
                </div>
            </div>
        </ToastProvider>
    )
}