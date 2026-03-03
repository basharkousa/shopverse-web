import { useSelector } from "react-redux";

export default function ProfilePage() {
    const user = useSelector((s) => s.auth.user);

    return (
        <div className="container" style={{ paddingTop: 24 }}>
            <div className="card">
                <h2 style={{ marginTop: 0 }}>My Profile</h2>
                <p className="muted">This page is protected.</p>

                <pre
                    style={{
                        margin: 0,
                        padding: 12,
                        borderRadius: 10,
                        background: "#fafafa",
                        border: "1px solid #eee",
                        overflowX: "auto",
                    }}
                >
          {JSON.stringify(user, null, 2)}
        </pre>
            </div>
        </div>
    );
}