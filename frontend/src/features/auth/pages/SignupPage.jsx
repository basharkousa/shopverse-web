import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signupThunk } from "../authSlice";
import { showToast } from "../../../store/uiSlice";

function validate(values) {
    const errors = {};

    if (!values.full_name.trim()) {
        errors.full_name = "Full name is required";
    }

    if (!values.email.trim()) {
        errors.email = "Email is required";
    }

    if (!values.password.trim()) {
        errors.password = "Password is required";
    } else if (values.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
    }

    if (!values.confirmPassword.trim()) {
        errors.confirmPassword = "Please confirm your password";
    } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    }

    return errors;
}

export default function SignupPage() {
    const dispatch = useDispatch();

    const authStatus = useSelector((state) => state.auth.status);
    const authError = useSelector((state) => state.auth.error);
    const token = useSelector((state) => state.auth.token);

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [touched, setTouched] = useState({
        full_name: false,
        email: false,
        password: false,
        confirmPassword: false,
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
                full_name: true,
                email: true,
                password: true,
                confirmPassword: true,
            });
            return;
        }

        dispatch(
            signupThunk({
                full_name: form.full_name,
                email: form.email,
                password: form.password,
            })
        );
    }

    if (token) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
            <div className="card" style={{ maxWidth: 560, margin: "0 auto" }}>
                <h1 style={{ marginTop: 0 }}>Create Account</h1>
                <p className="muted" style={{ marginTop: 8 }}>
                    Register to start shopping on ShopVerse.
                </p>

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, marginTop: 18 }}>
                    <div>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>
                            Full Name
                        </label>
                        <input
                            className="input"
                            type="text"
                            name="full_name"
                            value={form.full_name}
                            onChange={handleChange}
                            onBlur={() => markTouched("full_name")}
                            placeholder="Enter your full name"
                        />
                        {(touched.full_name || submitAttempted) && errors.full_name && (
                            <div style={{ marginTop: 6, color: "#c92a2a", fontSize: 13, fontWeight: 600 }}>
                                {errors.full_name}
                            </div>
                        )}
                    </div>

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

                    <div>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>
                            Confirm Password
                        </label>
                        <input
                            className="input"
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            onBlur={() => markTouched("confirmPassword")}
                            placeholder="Confirm your password"
                        />
                        {(touched.confirmPassword || submitAttempted) && errors.confirmPassword && (
                            <div style={{ marginTop: 6, color: "#c92a2a", fontSize: 13, fontWeight: 600 }}>
                                {errors.confirmPassword}
                            </div>
                        )}
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={authStatus === "loading"}>
                        {authStatus === "loading" ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <p className="muted" style={{ marginTop: 16 }}>
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}