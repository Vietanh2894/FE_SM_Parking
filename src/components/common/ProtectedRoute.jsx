import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthService from '../../services/authService';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true/false = result
    const [checkComplete, setCheckComplete] = useState(false);
    
    useEffect(() => {
        const checkAuth = async () => {
            console.log('🛡️ ProtectedRoute: Starting authentication check for path:', location.pathname);
            try {
                // Simple token existence check first
                const token = AuthService.getToken();
                console.log('🔑 ProtectedRoute token check:', !!token, token ? `Length: ${token.length}` : 'No token');
                
                if (!token || token.trim() === '') {
                    console.log('❌ ProtectedRoute: No valid token found, redirecting to login');
                    setIsAuthenticated(false);
                    setCheckComplete(true);
                    return;
                }
                
                // If token exists and not empty, consider user authenticated
                // Let the actual API calls handle token validation
                console.log('✅ ProtectedRoute: Token found, allowing access');
                setIsAuthenticated(true);
                setCheckComplete(true);
                
            } catch (error) {
                console.error('❌ ProtectedRoute: Authentication check error:', error);
                AuthService.clearAuthData();
                setIsAuthenticated(false);
                setCheckComplete(true);
            }
        };
        
        checkAuth();
    }, [location.pathname]);
    
    // Show loading while checking authentication
    if (!checkComplete || isAuthenticated === null) {
        console.log('⏳ ProtectedRoute: Still checking authentication...');
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px',
                color: '#666'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #3498db',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        margin: '0 auto 15px',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p>Đang kiểm tra quyền truy cập...</p>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        console.log('🔄 ProtectedRoute: Redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // If authenticated, render children
    console.log('✅ ProtectedRoute: Rendering protected content');
    return children;
};

export default ProtectedRoute;
