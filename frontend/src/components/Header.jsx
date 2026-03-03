import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";

const linkStyle = ({ isActive }) => ({
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: 8,
    fontWeight: 600,
    color: isActive ? "#111" : "#555",
    background: isActive ? "#f2f2f2" : "transparent",
});

export default function Header() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((s) => s.auth.user);

    function onLogout() {
        dispatch(logout());
        navigate("/login");
    }

    return (
        <header style={{ borderBottom: "1px solid #ddd", background: "#fff" }}>
            <div
                className="container"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <div style={{ fontWeight: 800 }}>ShopVerse</div>

                <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <NavLink to="/" style={linkStyle}>
                        Home
                    </NavLink>

                    {user ? (
                        <>
                            <NavLink to="/profile" style={linkStyle}>
                                Profile
                            </NavLink>
                            <button className="btn" onClick={onLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" style={linkStyle}>
                                Login
                            </NavLink>
                            <NavLink to="/signup" style={linkStyle}>
                                Signup
                            </NavLink>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}