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
        <div style={{ padding: 24, display: "grid", gap: 16 }}>
            <div>
                <h2 style={{ margin: 0 }}>{appName}</h2>
                <p style={{ marginTop: 8, color: "#555" }}>
                    Home page placeholder for Sprint 1.
                </p>
            </div>

            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 16,
                    background: "#fafafa",
                }}
            >
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Backend status</div>

                {health.status === "loading" && <div style={{background:"#000000"}}>Loading…</div>}

                {health.status === "ok" && (
                    <div style={{ display: "grid", gap: 6 }}>
                        <div>✅ Connected</div>
                        <pre
                            style={{
                                margin: 0,
                                padding: 12,
                                borderRadius: 10,
                                background: "#fff",
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
                        <div style={{ color: "#555", fontSize: 14 }}>
                            Make sure backend is running on <code>http://localhost:5000</code>{" "}
                            and CORS allows <code>http://localhost:5173</code>.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}