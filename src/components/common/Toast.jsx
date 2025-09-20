import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', show, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (show && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            
            return () => clearTimeout(timer);
        }
    }, [show, onClose, duration]);

    if (!show) return null;

    return (
        <div className={`toast toast-${type} ${show ? 'toast-show' : ''}`}>
            <div className="toast-content">
                <div className="toast-icon">
                    {type === 'success' && <i className="bi bi-check-circle-fill"></i>}
                    {type === 'error' && <i className="bi bi-exclamation-circle-fill"></i>}
                    {type === 'info' && <i className="bi bi-info-circle-fill"></i>}
                    {type === 'warning' && <i className="bi bi-exclamation-triangle-fill"></i>}
                </div>
                <div className="toast-message">{message}</div>
                <button className="toast-close" onClick={onClose}>
                    <i className="bi bi-x"></i>
                </button>
            </div>
        </div>
    );
};

export default Toast;
