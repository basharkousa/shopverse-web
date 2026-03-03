import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk, clearAuthError } from "../authSlice";

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, error, token } = useSelector((s) => s.auth);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // If login succeeds (token exists), navigate away
    useEffect(() => {
        if (token) navigate("/");
    }, [token, navigate]);

    function onSubmit(e) {
        e.preventDefault();
        dispatch(clearAuthError());
        dispatch(loginThunk({ email, password }));
    }

    return (
        <div className="container" style={{ paddingTop: 32 }}>
            <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
                <h2 style={{ marginTop: 0 }}>Login</h2>
                <p className="muted" style={{ marginTop: 8 }}>
                    Enter your email and password.
                </p>

                {error && (
                    <div
                        style={{
                            marginTop: 12,
                            padding: 12,
                            borderRadius: 10,
                            border: "1px solid #f5c2c7",
                            background: "#f8d7da",
                            color: "#842029",
                        }}
                    >
                        {error}
                    </div>
                )}

                <form
                    onSubmit={onSubmit}
                    style={{ marginTop: 16, display: "grid", gap: 12 }}
                >
                    <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontWeight: 600 }}>Email</span>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="you@example.com"
                            required
                            style={{
                                padding: 10,
                                borderRadius: 10,
                                border: "1px solid #ddd",
                            }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontWeight: 600 }}>Password</span>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="••••••••"
                            required
                            minLength={6}
                            style={{
                                padding: 10,
                                borderRadius: 10,
                                border: "1px solid #ddd",
                            }}
                        />
                    </label>

                    <button className="btn" type="submit" disabled={status === "loading"}>
                        {status === "loading" ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div style={{ marginTop: 14 }} className="muted">
                    Don’t have an account? <Link to="/signup">Create one</Link>
                </div>
            </div>
        </div>
    );
}