export default function AdminDashboardPage() {
    return (
        <div className="card">
            <h1 style={{ marginTop: 0, marginBottom: 8 }}>Dashboard</h1>
            <p className="muted" style={{ marginTop: 0 }}>
                Welcome to the ShopVerse admin area.
            </p>

            <div className="grid-3" style={{ marginTop: 16 }}>
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Overview Stats</h3>
                    <p className="muted">This card will be implemented in Card 5.6.</p>
                </div>

                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Products</h3>
                    <p className="muted">Products management UI comes next.</p>
                </div>

                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Orders</h3>
                    <p className="muted">Orders management UI comes next.</p>
                </div>
            </div>
        </div>
    );
}