import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';
import authService from '../services/authService';

const HomePage = () => {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Lấy thông tin người dùng từ token
                const token = localStorage.getItem('token');
                if (token) {
                    const payload = authService.getTokenPayload(token);
                    if (payload) {
                        setUserData({
                            username: payload.sub || 'User',
                            role: payload.check || 'User'
                        });
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = async () => {
        try {
            const result = await authService.performLogout();
            if (result.success) {
                navigate('/login');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return (
            <div className="home-loading">
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">Đang tải...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="home-container">
            {/* Navigation */}
            <nav className="home-nav">
                <div className="nav-container">
                    <div className="nav-content">
                        <div className="nav-brand">
                            <div className="nav-logo">
                                <svg xmlns="http://www.w3.org/2000/svg" className="nav-logo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                </svg>
                            </div>
                            <h1 className="nav-title">SM Parking</h1>
                        </div>
                        <div className="nav-actions">
                            <button className="nav-button-logout" onClick={handleLogout}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-header">
                        <span className="hero-emoji">👋</span>
                        <h1 className="hero-title">
                            Chào mừng, <span className="hero-title-accent">{userData?.username || 'User'}</span>
                        </h1>
                        <p className="hero-subtitle">
                            Hệ thống quản lý bãi đỗ xe thông minh
                        </p>
                    </div>
                    
                    {/* Features Grid */}
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon-blue">
                                <svg xmlns="http://www.w3.org/2000/svg" className="feature-icon-svg-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="feature-title">Dashboard</h3>
                            <p className="feature-description">Xem tổng quan về các số liệu thống kê và hoạt động trong hệ thống.</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon-green">
                                <svg xmlns="http://www.w3.org/2000/svg" className="feature-icon-svg-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="feature-title">Quản lý người dùng</h3>
                            <p className="feature-description">Quản lý tài khoản người dùng, phân quyền và nhân viên.</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon-purple">
                                <svg xmlns="http://www.w3.org/2000/svg" className="feature-icon-svg-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="feature-title">Quản lý phương tiện</h3>
                            <p className="feature-description">Theo dõi và quản lý các phương tiện ra vào bãi đỗ xe.</p>
                        </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="actions-section">
                        <Link to="/dashboard" className="action-button">
                            <svg xmlns="http://www.w3.org/2000/svg" className="action-button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>Truy cập Dashboard</span>
                        </Link>
                        <p className="help-text">Truy cập vào trang dashboard để xem thống kê và quản lý hệ thống</p>
                    </div>
                </div>
            </section>
            
            {/* Footer */}
            <footer className="home-footer">
                <div className="footer-container">
                    <p className="footer-text">© 2025 SM Parking Management System</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;



