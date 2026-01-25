import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar"; 
import Footer from "../Components/Footer";

export default function AdminLayout() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar (Fixed) */}
            <Navbar /> 
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col ml-56 transition-all duration-300">
                <main className="flex-1 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}