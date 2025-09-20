import React from 'react';
import DashboardNavigation from '../components/DashboardNavigation';
import '../styles/DashboardLayout.css';

const DashboardLayout = ({ children }) => {
    return (
        <div className="dashboard-layout">
            <DashboardNavigation />
            <main className="dashboard-main">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
