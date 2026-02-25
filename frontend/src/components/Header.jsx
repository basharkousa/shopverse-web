import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: 8,
    fontWeight: 600,
    color: isActive ? "#111" : "#555",
    background: isActive ? "#f2f2f2" : "transparent",
});

export default function Header() {
    return (
        <header style={{ borderBottom: "1px solid #ddd", background: "#fff" }}>
            <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 800 }}>ShopVerse</div>

                <nav style={{ display: "flex", gap: 8 }}>
                    <NavLink to="/" style={linkStyle}>
                        Home
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}