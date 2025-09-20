import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { 
  LoginPage, 
  HomePage, 
  DashboardPage, 
  UserPage, 
  VehiclePage, 
  VehicleTypePage, 
  ParkingModePage, 
  PricePage, 
  ParkingLotPage, 
  StaffPage, 
  AccountPage, 
  RolePage, 
  ParkingTransactionPage,
  DangKyThangPage 
} from './pages';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthService from './services/authService';

// Initialize auth service interceptors
AuthService.setupInterceptors();

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route path="/home" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <UserPage />
        </ProtectedRoute>
      } />
      <Route path="/vehicles" element={
        <ProtectedRoute>
          <VehiclePage />
        </ProtectedRoute>
      } />
      <Route path="/vehicle-types" element={
        <ProtectedRoute>
          <VehicleTypePage />
        </ProtectedRoute>
      } />
      <Route path="/parking-modes" element={
        <ProtectedRoute>
          <ParkingModePage />
        </ProtectedRoute>
      } />
      <Route path="/prices" element={
        <ProtectedRoute>
          <PricePage />
        </ProtectedRoute>
      } />
      <Route path="/parking-lots" element={
        <ProtectedRoute>
          <ParkingLotPage />
        </ProtectedRoute>
      } />
      <Route path="/staff" element={
        <ProtectedRoute>
          <StaffPage />
        </ProtectedRoute>
      } />
      <Route path="/accounts" element={
        <ProtectedRoute>
          <AccountPage />
        </ProtectedRoute>
      } />
      <Route path="/roles" element={
        <ProtectedRoute>
          <RolePage />
        </ProtectedRoute>
      } />
      <Route path="/parking-transactions" element={
        <ProtectedRoute>
          <ParkingTransactionPage />
        </ProtectedRoute>
      } />
      <Route path="/dang-ky-thang" element={
        <ProtectedRoute>
          <DangKyThangPage />
        </ProtectedRoute>
      } />
      {/* Catch all route - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
