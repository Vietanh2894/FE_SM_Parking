import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/authService';
import '../styles/LoginPage.css';

const LoginPage = () => {
    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check if user is already logged in
    useEffect(() => {
        // Check for token first
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found, staying on login page');
            return;
        }
        
        console.log('Token found, verifying authentication status');
        
        // Simple check based on token existence
        if (AuthService.isAuthenticated()) {
            console.log('User appears to be authenticated, redirecting');
            const from = location.state?.from?.pathname || '/home';
            navigate(from, { replace: true });
        }
    }, [navigate, location]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            console.log('🔐 Attempting unified login with credential:', credential);
            
            // Use AuthService unified login method
            const result = await AuthService.login(credential, password);

            if (result.success) {
                console.log('✅ Login successful:', result);
                
                const { userType, userInfo, staffInfo } = result;
                
                // Determine redirect path based on user type
                let redirectPath = '/home';
                if (userType === 'STAFF') {
                    redirectPath = '/dashboard'; // Staff goes to dashboard
                } else if (userType === 'USER') {
                    redirectPath = '/user/dashboard'; // User goes to user dashboard
                }
                
                // Use the originally intended page if available, otherwise use type-based redirect
                const from = location.state?.from?.pathname || redirectPath;
                console.log('🔀 Redirecting to:', from);
                
                navigate(from, { replace: true });
            } else {
                console.error('❌ Login failed:', result.error);
                setError(result.error || 'Đăng nhập thất bại');
            }
        } catch (err) {
            console.error('❌ Login error:', err);
            setError('Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Logo/Header */}
                <div className="login-header">
                    <div className="login-logo">
                        <svg className="login-logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                    </div>
                    <h2 className="login-title">SM Parking</h2>
                    <p className="login-subtitle">Đăng nhập vào hệ thống</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="credential" className="form-label">
                            Email hoặc Tên đăng nhập
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="credential"
                                value={credential}
                                onChange={(e) => setCredential(e.target.value)}
                                className="form-input"
                                placeholder="Nhập email (cho User) hoặc tên đăng nhập (cho Staff)"
                                required
                            />
                            <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            • Nhập <strong>email</strong> nếu bạn là người dùng
                            <br />
                            • Nhập <strong>tên đăng nhập</strong> nếu bạn là nhân viên
                        </p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Mật khẩu
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                placeholder="Nhập mật khẩu"
                                required
                            />
                            <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>

                    {error && (
                        <div className="error-container">
                            <div className="error-content">
                                <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="error-text">{error}</p>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="login-button"
                    >
                        {loading ? (
                            <div className="loading-content">
                                <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang đăng nhập...
                            </div>
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="login-footer">
                    <p className="footer-text">
                        © 2025 SM Parking Management System
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
