import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import ToastContainer from "./ToastContainer.jsx";

export default function Layout() {
    return (
        <div className="app-shell">
            <Header />

            <main className="app-main">
                <Outlet />
            </main>

            <Footer />
            <ToastContainer />
        </div>
    );
}