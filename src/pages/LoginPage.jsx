import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/authService';
import '../styles/LoginPage.css';

// Tạo instance API riêng cho login để tránh xung đột với interceptor
const loginApi = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
});

const LoginPage = () => {
    const [username, setUsername] = useState('');
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
            console.log('🔐 Attempting login with username:', username);
            const response = await loginApi.post('/login', {
                username,
                password,
            });

            console.log('✅ Login response:', response.data);

            // Check if response has the correct format
            // Expected format: { statusCode, error, message, data: { accessToken } }
            if (response.data && response.data.statusCode === 200 && response.data.data && response.data.data.accessToken) {
                const token = response.data.data.accessToken;
                localStorage.setItem('token', token);
                console.log('✅ Token stored successfully, length:', token.length);
                
                // Redirect to the originally intended page or home
                const from = location.state?.from?.pathname || '/home';
                console.log('🔀 Redirecting to:', from);
                navigate(from, { replace: true });
            } else {
                console.error('❌ Login response missing expected data structure');
                setError('Login failed: Invalid response from server.');
                console.log('Response structure:', JSON.stringify(response.data, null, 2));
            }
        } catch (err) {
            console.error('❌ Login error:', err);
            
            if (err.response?.data) {
                const errorMessage = err.response.data.message || err.response.data.error || 'Login failed';
                console.log('Error message from server:', errorMessage);
                setError(errorMessage);
            } else if (err.code === 'ERR_NETWORK') {
                setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối!');
            } else {
                setError('Invalid username or password.');
            }
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
                        <label htmlFor="username" className="form-label">
                            Tên đăng nhập
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="form-input"
                                placeholder="Nhập tên đăng nhập"
                                required
                            />
                            <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
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
