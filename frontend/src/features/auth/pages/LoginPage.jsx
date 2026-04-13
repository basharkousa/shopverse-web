import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../authSlice";
import { showToast } from "../../../store/uiSlice";

function validate(values) {
    const errors = {};

    if (!values.email.trim()) {
        errors.email = "Email is required";
    }

    if (!values.password.trim()) {
        errors.password = "Password is required";
    }

    return errors;
}

export default function LoginPage() {
    const dispatch = useDispatch();

    const authStatus = useSelector((state) => state.auth.status);
    const authError = useSelector((state) => state.auth.error);
    const token = useSelector((state) => state.auth.token);

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [touched, setTouched] = useState({
        email: false,
        password: false,
    });

    const [submitAttempted, setSubmitAttempted] = useState(false);

    const errors = validate(form);
    const isValid = Object.keys(errors).length === 0;

    useEffect(() => {
        if (authStatus === "failed" && authError) {
            dispatch(
                showToast({
                    type: "error",
                    message: authError,
                })
            );
        }
    }, [authStatus, authError, dispatch]);

    function markTouched(key) {
        setTouched((prev) => ({ ...prev, [key]: true }));
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitAttempted(true);

        if (!isValid) {
            setTouched({
                email: true,
                password: true,
            });
            return;
        }

        dispatch(loginThunk(form));
    }

    if (token) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
            <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
                <h1 style={{ marginTop: 0 }}>Login</h1>
                <p className="muted" style={{ marginTop: 8 }}>
                    Sign in to your ShopVerse account.
                </p>

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, marginTop: 18 }}>
                    <div>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>
                            Email
                        </label>
                        <input
                            className="input"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            onBlur={() => markTouched("email")}
                            placeholder="Enter your email"
                        />
                        {(touched.email || submitAttempted) && errors.email && (
                            <div style={{ marginTop: 6, color: "#c92a2a", fontSize: 13, fontWeight: 600 }}>
                                {errors.email}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>
                            Password
                        </label>
                        <input
                            className="input"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            onBlur={() => markTouched("password")}
                            placeholder="Enter your password"
                        />
                        {(touched.password || submitAttempted) && errors.password && (
                            <div style={{ marginTop: 6, color: "#c92a2a", fontSize: 13, fontWeight: 600 }}>
                                {errors.password}
                            </div>
                        )}
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={authStatus === "loading"}>
                        {authStatus === "loading" ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <p className="muted" style={{ marginTop: 16 }}>
                    Don’t have an account? <Link to="/signup">Create one</Link>
                </p>
            </div>
        </div>
    );
}