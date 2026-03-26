import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";

function navStyle({ isActive }) {
    return {
        display: "block",
        textDecoration: "none",
        padding: "12px 14px",
        borderRadius: 12,
        fontWeight: 700,
        color: isActive ? "#fff" : "#1f2937",
        background: isActive ? "var(--brand-600)" : "transparent",
        border: isActive ? "1px solid var(--brand-600)" : "1px solid transparent",
    };
}

export default function AdminLayout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((s) => s.auth.user);

    function onLogout() {
        dispatch(logout());
        navigate("/login");
    }

    return (
        <div className="admin-shell container">
            <aside className="admin-sidebar card">
                <div className="admin-sidebar__brand">
                    <div className="admin-sidebar__logo">SV</div>
                    <div>
                        <div className="admin-sidebar__title">ShopVerse Admin</div>
                        <div className="muted admin-sidebar__subtitle">Control panel</div>
                    </div>
                </div>

                <nav className="admin-sidebar__nav">
                    <NavLink to="/admin" end style={navStyle}>
                        Dashboard
                    </NavLink>

                    <NavLink to="/admin/products" style={navStyle}>
                        Products
                    </NavLink>

                    <NavLink to="/admin/orders" style={navStyle}>
                        Orders
                    </NavLink>
                </nav>

                <div className="admin-sidebar__footer">
                    <button className="btn" onClick={() => navigate("/")}>
                        Back to Store
                    </button>
                </div>
            </aside>

            <section className="admin-content">
                <div className="admin-topbar card">
                    <div>
                        <div className="admin-topbar__title">Admin Dashboard</div>
                        <div className="muted admin-topbar__subtitle">
                            Manage products and orders
                        </div>
                    </div>

                    <div className="admin-topbar__actions">
                        <div className="admin-user-chip">
                            <span className="admin-user-chip__dot" />
                            <span>{user?.full_name || user?.email || "Admin"}</span>
                        </div>

                        <button className="btn" onClick={onLogout}>
                            Logout
                        </button>
                    </div>
                </div>

                <div className="admin-page-body">
                    <Outlet />
                </div>
            </section>
        </div>
    );
}