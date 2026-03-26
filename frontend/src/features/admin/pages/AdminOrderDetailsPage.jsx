import { useParams } from "react-router-dom";

export default function AdminOrderDetailsPage() {
    const { id } = useParams();

    return (
        <div className="card">
            <h1 style={{ marginTop: 0, marginBottom: 8 }}>Order Details</h1>
            <p className="muted" style={{ marginTop: 0 }}>
                Viewing admin details for order <strong>#{id}</strong>.
            </p>
            <p className="muted">
                Full order detail UI will be implemented in the later admin card.
            </p>
        </div>
    );
}