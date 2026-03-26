import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AdminRoute({ children }) {
    const { user, status } = useSelector((s) => s.auth);

    if (status === "loading") {
        return (
            <div className="container" style={{ paddingTop: 32 }}>
                <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
                    <h3 style={{ marginTop: 0 }}>Loading…</h3>
                    <p className="muted">Checking your admin session.</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return children;
}