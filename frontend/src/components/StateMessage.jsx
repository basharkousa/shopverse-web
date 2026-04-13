export default function StateMessage({
                                         type = "info",
                                         title,
                                         message,
                                         action,
                                         compact = false,
                                     }) {
    return (
        <div
            className={`state-message state-message--${type} ${
                compact ? "state-message--compact" : ""
            }`}
        >
            <div className="state-message__body">
                {title ? <h3 className="state-message__title">{title}</h3> : null}
                {message ? <p className="state-message__text">{message}</p> : null}
                {action ? <div className="state-message__action">{action}</div> : null}
            </div>
        </div>
    );
}