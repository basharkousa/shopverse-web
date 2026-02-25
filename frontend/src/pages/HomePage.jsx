import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getHealth } from "../api/client";

export default function HomePage() {
    const appName = useSelector((state) => state.ui.appName);

    const [health, setHealth] = useState({
        status: "loading", // loading | ok | error
        data: null,
        error: null,
    });

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const data = await getHealth();
                if (!mounted) return;
                setHealth({ status: "ok", data, error: null });
            } catch (err) {
                if (!mounted) return;
                setHealth({
                    status: "error",
                    data: null,
                    error: err?.message || "Failed to reach backend",
                });
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="container" style={{ display: "grid", gap: 16 }}>
            <div>
                <h2 style={{ margin: 0 }}>{appName}</h2>
                <p className="muted" style={{ marginTop: 8 }}>
                    Home page placeholder for Sprint 1.
                </p>
            </div>

            <div className="card">
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Backend status</div>

                {health.status === "loading" && <div>Loading…</div>}

                {health.status === "ok" && (
                    <div style={{ display: "grid", gap: 6 }}>
                        <div>✅ Connected</div>
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
            {JSON.stringify(health.data, null, 2)}
          </pre>
                    </div>
                )}

                {health.status === "error" && (
                    <div style={{ display: "grid", gap: 6 }}>
                        <div>❌ Not connected</div>
                        <div style={{ color: "#a00" }}>{health.error}</div>
                        <div className="muted" style={{ fontSize: 14 }}>
                            Make sure backend is running on <code>http://localhost:5000</code>{" "}
                            and CORS allows <code>http://localhost:5173</code>.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}