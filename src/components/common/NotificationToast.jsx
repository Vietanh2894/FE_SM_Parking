import React, { useState, useEffect } from 'react';

const NotificationToast = ({ 
    notification, 
    onClose, 
    duration = 5000,
    position = 'top-right' 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (notification) {
            setIsVisible(true);
            setIsExiting(false);

            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [notification, duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 300); // Animation duration
    };

    if (!notification || !isVisible) return null;

    const getTypeStyles = () => {
        switch (notification.type) {
            case 'success':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    icon: 'text-green-400',
                    title: 'text-green-800',
                    message: 'text-green-700'
                };
            case 'error':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    icon: 'text-red-400',
                    title: 'text-red-800',
                    message: 'text-red-700'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    icon: 'text-yellow-400',
                    title: 'text-yellow-800',
                    message: 'text-yellow-700'
                };
            case 'info':
            default:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    icon: 'text-blue-400',
                    title: 'text-blue-800',
                    message: 'text-blue-700'
                };
        }
    };

    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'info':
            default:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getPositionStyles = () => {
        switch (position) {
            case 'top-left':
                return 'top-4 left-4';
            case 'top-center':
                return 'top-4 left-1/2 transform -translate-x-1/2';
            case 'top-right':
            default:
                return 'top-4 right-4';
            case 'bottom-left':
                return 'bottom-4 left-4';
            case 'bottom-center':
                return 'bottom-4 left-1/2 transform -translate-x-1/2';
            case 'bottom-right':
                return 'bottom-4 right-4';
        }
    };

    const styles = getTypeStyles();

    return (
        <div 
            className={`fixed z-50 ${getPositionStyles()} transition-all duration-300 ease-in-out ${
                isExiting 
                    ? 'opacity-0 transform translate-x-full' 
                    : 'opacity-100 transform translate-x-0'
            }`}
        >
            <div className={`
                max-w-sm w-full ${styles.bg} border ${styles.border} rounded-lg shadow-lg p-4
                transform transition-all duration-300 ease-in-out
            `}>
                <div className="flex items-start">
                    <div className={`flex-shrink-0 ${styles.icon}`}>
                        {getIcon()}
                    </div>
                    
                    <div className="ml-3 flex-1">
                        {notification.title && (
                            <h3 className={`text-sm font-medium ${styles.title} mb-1`}>
                                {notification.title}
                            </h3>
                        )}
                        <div className={`text-sm ${styles.message}`}>
                            {notification.message}
                        </div>
                        
                        {notification.details && (
                            <div className={`text-xs ${styles.message} mt-2 opacity-75`}>
                                {notification.details}
                            </div>
                        )}
                    </div>
                    
                    <div className="ml-4 flex-shrink-0">
                        <button
                            className={`inline-flex ${styles.message} hover:opacity-75 focus:outline-none`}
                            onClick={handleClose}
                        >
                            <span className="sr-only">Đóng</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* Progress bar */}
                <div className={`mt-3 w-full bg-gray-200 rounded-full h-1 overflow-hidden`}>
                    <div 
                        className={`h-full transition-all ease-linear ${
                            notification.type === 'success' ? 'bg-green-400' :
                            notification.type === 'error' ? 'bg-red-400' :
                            notification.type === 'warning' ? 'bg-yellow-400' :
                            'bg-blue-400'
                        }`}
                        style={{
                            width: '100%',
                            animation: `toast-shrink ${duration}ms linear forwards`
                        }}
                    />
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes toast-shrink {
                        from { width: 100%; }
                        to { width: 0%; }
                    }
                `
            }} />
        </div>
    );
};

// Toast Context Provider
export const ToastContext = React.createContext();

export const ToastProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = (type, message, title = null, details = null, duration = 5000) => {
        setNotification({
            type,
            message,
            title,
            details,
            duration,
            id: Date.now()
        });
    };

    const hideNotification = () => {
        setNotification(null);
    };

    // Convenience methods
    const showSuccess = (message, title = 'Thành công!', details = null) => {
        showNotification('success', message, title, details);
    };

    const showError = (message, title = 'Lỗi!', details = null) => {
        showNotification('error', message, title, details);
    };

    const showWarning = (message, title = 'Cảnh báo!', details = null) => {
        showNotification('warning', message, title, details);
    };

    const showInfo = (message, title = 'Thông tin', details = null) => {
        showNotification('info', message, title, details);
    };

    return (
        <ToastContext.Provider value={{
            showNotification,
            hideNotification,
            showSuccess,
            showError,
            showWarning,
            showInfo
        }}>
            {children}
            <NotificationToast 
                notification={notification} 
                onClose={hideNotification}
                duration={notification?.duration}
            />
        </ToastContext.Provider>
    );
};

// Custom hook
export const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export default NotificationToast;