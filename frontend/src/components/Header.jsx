import {NavLink, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {logout} from "../features/auth/authSlice";
import {selectCartCount} from '../features/cart/cartSlice';

const linkStyle = ({isActive}) => ({
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
    const cartCount = useSelector(selectCartCount);


    function onLogout() {
        dispatch(logout());
        navigate("/login");
    }

    return (
        <header style={{borderBottom: "1px solid #ddd", background: "#fff"}}>
            <div
                className="container"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <div style={{fontWeight: 800, color: "var(--brand-700)"}}>ShopVerse</div>

                <nav style={{display: "flex", gap: 8, alignItems: "center"}}>
                    <NavLink to="/" style={linkStyle}>
                        Home
                    </NavLink>

                    {user ? (
                        <>
                            <NavLink to="/cart" style={linkStyle}>
    <span style={{position: "relative", display: "inline-flex", alignItems: "center"}}>
        Cart
        {cartCount > 0 && (
            <span
                style={{
                    position: "absolute",
                    top: -10,
                    right: -18,
                    minWidth: 20,
                    height: 20,
                    padding: "0 6px",
                    borderRadius: 999,
                    background: "#2f9e44",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                }}
            >
                {cartCount}
            </span>
        )}
    </span>
                            </NavLink>
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