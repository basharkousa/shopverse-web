import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signupThunk, clearAuthError } from "../authSlice";

export default function SignupPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, error, user } = useSelector((s) => s.auth);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // If signup succeeds, redirect to login
    useEffect(() => {
        // We consider signup success when we got a user and status succeeded
        if (status === "succeeded" && user) {
            navigate("/login");
        }
    }, [status, user, navigate]);

    function onSubmit(e) {
        e.preventDefault();
        dispatch(clearAuthError());

        dispatch(
            signupThunk({
                full_name: fullName,
                email,
                password,
            })
        );
    }

    return (
        <div className="container" style={{ paddingTop: 32 }}>
            <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
                <h2 style={{ marginTop: 0 }}>Create account</h2>
                <p className="muted" style={{ marginTop: 8 }}>
                    Fill your details to sign up.
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
                        <span style={{ fontWeight: 600 }}>Full name</span>
                        <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            type="text"
                            placeholder="Your name"
                            required
                            style={{
                                padding: 10,
                                borderRadius: 10,
                                border: "1px solid #ddd",
                            }}
                        />
                    </label>

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
                            placeholder="At least 6 characters"
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
                        {status === "loading" ? "Creating..." : "Create account"}
                    </button>
                </form>

                <div style={{ marginTop: 14 }} className="muted">
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
}