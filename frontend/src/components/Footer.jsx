export default function Footer() {
    return (
        <footer style={{ borderTop: "1px solid #ddd", background: "#fff" }}>
            <div className="container">
                <small>© {new Date().getFullYear()} ShopVerse</small>
            </div>
        </footer>
    );
}