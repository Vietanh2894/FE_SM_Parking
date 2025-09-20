import React, { useState, useEffect } from 'react';
import AuthService from '../../services/authService';

const AuthStatusCard = ({ onAuthChange = null }) => {
    const [authStatus, setAuthStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastChecked, setLastChecked] = useState(null);

    const checkAuthStatus = async () => {
        setLoading(true);
        try {
            const result = await AuthService.checkAuth();
            setAuthStatus(result);
            setLastChecked(new Date());
            
            // Notify parent component if provided
            if (onAuthChange) {
                onAuthChange(result);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setAuthStatus({
                success: false,
                message: 'Error checking authentication status'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
        
        // Auto refresh every 5 minutes
        const interval = setInterval(checkAuthStatus, 5 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        checkAuthStatus();
    };

    if (loading && !authStatus) {
        return (
            <div className="auth-status-card loading">
                <div className="auth-spinner"></div>
                <span>Checking auth...</span>
            </div>
        );
    }

    if (!authStatus) {
        return null;
    }

    return (
        <div className={`auth-status-card ${authStatus.success ? 'authenticated' : 'not-authenticated'}`}>
            <div className="auth-header">
                <span className={`auth-indicator ${authStatus.success ? 'green' : 'red'}`}>
                    {authStatus.success ? '🟢' : '🔴'}
                </span>
                <span className="auth-title">
                    {authStatus.success ? 'Authenticated' : 'Not Authenticated'}
                </span>
                <button 
                    className="refresh-btn" 
                    onClick={handleRefresh}
                    disabled={loading}
                    title="Refresh auth status"
                >
                    {loading ? '🔄' : '↻'}
                </button>
            </div>
            
            <div className="auth-details">
                <div className="auth-message">
                    <pre>{authStatus.message}</pre>
                </div>
                
                {lastChecked && (
                    <div className="last-checked">
                        <small>
                            Last checked: {lastChecked.toLocaleTimeString()}
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthStatusCard;
