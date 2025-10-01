import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { 
  LoginPage, 
  HomePage, 
  DashboardPage, 
  UserDashboardPage,
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
  DangKyThangPage,
  FaceRecognitionDemo,
  FaceRegistrationPage,
  FaceRecognitionPage,
  FaceComparisonPage,
  FaceManagementPage
} from './pages';
import FaceApiTester from './components/FaceApiTester';
import FaceApiTestPage from './pages/FaceApiTestPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { ToastProvider } from './components/common/NotificationToast';
import AuthService from './services/authService';

// Initialize auth service interceptors
AuthService.setupInterceptors();

function App() {
  return (
    <ToastProvider>
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
      <Route path="/user/dashboard" element={
        <ProtectedRoute>
          <UserDashboardPage />
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
      
      {/* Face Recognition routes */}
      <Route path="/face-api-tester" element={
        <ProtectedRoute>
          <FaceApiTester />
        </ProtectedRoute>
      } />
      <Route path="/face-api-test-page" element={
        <ProtectedRoute>
          <FaceApiTestPage />
        </ProtectedRoute>
      } />
      <Route path="/face-recognition-demo" element={
        <ProtectedRoute>
          <FaceRecognitionDemo />
        </ProtectedRoute>
      } />
      <Route path="/face-registration" element={
        <ProtectedRoute>
          <FaceRegistrationPage />
        </ProtectedRoute>
      } />
      <Route path="/face-recognition" element={
        <ProtectedRoute>
          <FaceRecognitionPage />
        </ProtectedRoute>
      } />
      <Route path="/face-comparison" element={
        <ProtectedRoute>
          <FaceComparisonPage />
        </ProtectedRoute>
      } />
      <Route path="/face-management" element={
        <ProtectedRoute>
          <FaceManagementPage />
        </ProtectedRoute>
      } />
      
      {/* Catch all route - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </ToastProvider>
  );
}

export default App;
