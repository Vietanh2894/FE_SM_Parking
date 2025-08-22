import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, HomePage, UserPage, VehiclePage } from './pages';
import { DashboardLayout } from './layouts';
import { DashboardContent } from './components';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardContent />} /> {/* Default dashboard content */}
        <Route path="users" element={<UserPage />} />
        <Route path="vehicles" element={<VehiclePage />} />
        {/* Add other dashboard routes here, for example: */}
      </Route>
    </Routes>
  );
}

export default App;