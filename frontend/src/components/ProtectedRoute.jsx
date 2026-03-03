import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
    const { user, status } = useSelector((s) => s.auth);

    // While we are trying to restore auth on app start
    if (status === "loading") {
        return (
            <div className="container" style={{ paddingTop: 32 }}>
                <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
                    <h3 style={{ marginTop: 0 }}>Loading…</h3>
                    <p className="muted">Checking your session.</p>
                </div>
            </div>
        );
    }

    // Not logged in → go to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Logged in → render protected content
    return children;
}