import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import './DashboardLayout.css';

const getTitle = (pathname) => {
    switch (pathname) {
        case '/dashboard':
            return 'Dashboard Overview';
        case '/dashboard/users':
            return 'User Management';
        case '/dashboard/vehicles':
            return 'Vehicle Management';
        // Add other cases as needed
        default:
            return 'Dashboard';
    }
};

const DashboardLayout = () => {
    const location = useLocation();
    const title = getTitle(location.pathname);

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <i className="bi bi-p-circle-fill"></i>
                    <span>Smart Parking</span>
                </div>
                <ul className="sidebar-menu">
                    <li><NavLink to="/dashboard" end><i className="bi bi-grid-1x2-fill"></i><span>Dashboard</span></NavLink></li>
                    <li><NavLink to="/dashboard/users"><i className="bi bi-people-fill"></i><span>User</span></NavLink></li>
                    <li><NavLink to="/dashboard/vehicles"><i className="bi bi-car-front-fill"></i><span>Vehicle</span></NavLink></li>
                    <li><NavLink to="/dashboard/vehicle-types"><i className="bi bi-tags-fill"></i><span>Vehicle Type</span></NavLink></li>
                    <li><NavLink to="/dashboard/invoices"><i className="bi bi-receipt"></i><span>Invoice</span></NavLink></li>
                </ul>
            </aside>
            <div className="main-content-wrapper">
                <header className="header">
                    <div className="header-title">{title}</div>
                    <div className="header-actions">
                        <div className="user-profile">
                            <img src="https://i.pravatar.cc/40" alt="User Avatar" className="user-avatar" />
                            <span className="user-name">Adams</span>
                        </div>
                    </div>
                </header>
                <main className="content-area">
                    <Outlet /> {/* Child routes will render here */}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
