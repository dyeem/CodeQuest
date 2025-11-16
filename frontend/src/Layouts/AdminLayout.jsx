import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
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

            </footer>
        </div>
        </>
    )
}