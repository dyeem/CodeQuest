import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
export default function AdminLayout() {
    return (
        <>
        <div className="">
            <nav>
                <Navbar/>
            </nav>
            <main>
                <Outlet/>
            </main>
            <footer>
                <Footer/>
            </footer>
        </div>
        </>
    )
}