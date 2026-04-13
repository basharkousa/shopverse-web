import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeToast, selectToasts } from "../store/uiSlice";

export default function ToastContainer() {
    const dispatch = useDispatch();
    const toasts = useSelector(selectToasts);

    useEffect(() => {
        const timers = toasts.map((toast) =>
            setTimeout(() => {
                dispatch(removeToast(toast.id));
            }, toast.duration || 3000)
        );

        return () => {
            timers.forEach((timer) => clearTimeout(timer));
        };
    }, [toasts, dispatch]);

    if (!toasts.length) return null;

    return (
        <div className="toast-stack" aria-live="polite" aria-atomic="true">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast toast--${toast.type}`}
                    role="status"
                >
                    <div className="toast__content">
                        <div className="toast__title">
                            {toast.type === "success"
                                ? "Success"
                                : toast.type === "error"
                                    ? "Error"
                                    : "Info"}
                        </div>
                        <div className="toast__message">{toast.message}</div>
                    </div>

                    <button
                        type="button"
                        className="toast__close"
                        onClick={() => dispatch(removeToast(toast.id))}
                        aria-label="Dismiss notification"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}