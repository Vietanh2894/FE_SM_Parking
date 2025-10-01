import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';
import UserDashboardService from '../services/userDashboardService';
import ExtensionRequestModal from '../components/modals/ExtensionRequestModal';
import CreateVehicleModal from '../components/modals/CreateVehicleModal';
import CreateMonthlyRegistrationModal from '../components/modals/CreateMonthlyRegistrationModal';
import RegistrationCard from '../components/common/RegistrationCard';
import PendingRequestList from '../components/common/PendingRequestList';
import NotificationToast, { useToast } from '../components/common/NotificationToast';
import { isMockModeEnabled, isApiEnabled, logDevInfo, logApiError, DEV_CONFIG } from '../utils/devConfig';

const UserDashboardPage = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [userData, setUserData] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modal states
    const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [isCreateVehicleModalOpen, setIsCreateVehicleModalOpen] = useState(false);
    const [isCreateRegistrationModalOpen, setIsCreateRegistrationModalOpen] = useState(false);
    const [selectedVehicleForRegistration, setSelectedVehicleForRegistration] = useState(null);

    // Filters and views
    const [registrationFilter, setRegistrationFilter] = useState('all'); // all, active, expired, expiring
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // New states for vehicle view
    const [currentView, setCurrentView] = useState('dashboard'); // dashboard, vehicles, vehicle-history
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [vehicleRegistrations, setVehicleRegistrations] = useState([]);

    useEffect(() => {
        // Check if user is authenticated
        const userInfo = AuthService.getCurrentUserInfo();
        if (!userInfo) {
            navigate('/login', { replace: true });
            return;
        }

        setUserData(userInfo);
        loadDashboardData();
    }, [navigate]);

    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            let data;
            
            // Check if we should use mock data or try API
            if (isMockModeEnabled() || !isApiEnabled()) {
                logDevInfo('Using mock data (API disabled or mock mode enabled)');
                
                // Use mock data from config
                data = {
                    userInfo: {
                        ...DEV_CONFIG.MOCK_USER_DATA,
                        name: userData?.name || DEV_CONFIG.MOCK_USER_DATA.name,
                        email: userData?.email || DEV_CONFIG.MOCK_USER_DATA.email
                    },
                    summary: {
                        totalRegistrations: DEV_CONFIG.MOCK_REGISTRATIONS.length,
                        activeRegistrations: DEV_CONFIG.MOCK_REGISTRATIONS.filter(r => r.trangThai === 'ACTIVE').length,
                        expiringSoon: DEV_CONFIG.MOCK_REGISTRATIONS.filter(r => r.trangThai === 'ACTIVE' && r.daysUntilExpiry <= 30).length,
                        totalAmountPaid: DEV_CONFIG.MOCK_REGISTRATIONS.reduce((sum, r) => sum + r.soTienThanhToan, 0)
                    },
                    registrations: DEV_CONFIG.MOCK_REGISTRATIONS,
                    pendingExtensions: DEV_CONFIG.MOCK_PENDING_EXTENSIONS
                };
                
                // Show info that we're in mock mode
                toast?.showInfo(
                    'Đang sử dụng dữ liệu demo',
                    'Chế độ phát triển',
                    'Hệ thống đang chạy với dữ liệu mẫu. Để sử dụng API thật, hãy cập nhật devConfig.js'
                );
                
            } else {
                // Try to load real data from API
                try {
                    logDevInfo('Attempting to load data from API');
                    const response = await UserDashboardService.getUserDashboard();
                    logDevInfo('API response:', response);
                    
                    if (response.success && response.data) {
                        data = response.data; // Use the actual data from response
                        logDevInfo('API data loaded successfully', data);
                    } else {
                        throw new Error(response.message || 'Invalid response from server');
                    }
                } catch (apiError) {
                    logApiError(apiError, 'getUserDashboard');
                    
                    // Fallback to mock data
                    data = {
                        userInfo: {
                            ...DEV_CONFIG.MOCK_USER_DATA,
                            name: userData?.name || DEV_CONFIG.MOCK_USER_DATA.name,
                            email: userData?.email || DEV_CONFIG.MOCK_USER_DATA.email
                        },
                        summary: {
                            totalRegistrations: DEV_CONFIG.MOCK_REGISTRATIONS.length,
                            activeRegistrations: DEV_CONFIG.MOCK_REGISTRATIONS.filter(r => r.trangThai === 'ACTIVE').length,
                            expiringSoon: DEV_CONFIG.MOCK_REGISTRATIONS.filter(r => r.trangThai === 'ACTIVE' && r.daysUntilExpiry <= 30).length,
                            totalAmountPaid: DEV_CONFIG.MOCK_REGISTRATIONS.reduce((sum, r) => sum + r.soTienThanhToan, 0)
                        },
                        registrations: DEV_CONFIG.MOCK_REGISTRATIONS,
                        pendingExtensions: DEV_CONFIG.MOCK_PENDING_EXTENSIONS
                    };
                    
                    toast?.showWarning(
                        'API không khả dụng - sử dụng dữ liệu demo',
                        'Lỗi kết nối backend',
                        'Vui lòng kiểm tra kết nối backend hoặc liên hệ admin.'
                    );
                }
            }
            
            setDashboardData(data);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
            toast?.showError('Không thể tải dữ liệu dashboard', 'Lỗi hệ thống', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        AuthService.clearAuthData();
        navigate('/login', { replace: true });
    };

    const handleExtensionRequest = (registration) => {
        setSelectedRegistration(registration);
        setIsExtensionModalOpen(true);
    };

    const handleExtensionSuccess = () => {
        setIsExtensionModalOpen(false);
        setSelectedRegistration(null);
        
        // Show success notification
        toast?.showSuccess(
            'Yêu cầu gia hạn đã được gửi thành công!',
            'Thành công!',
            'Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.'
        );
        
        // Reload dashboard to update data
        handleRefreshRequests();
    };

    const handleRefreshRequests = async () => {
        setIsRefreshing(true);
        toast?.showInfo('Đang làm mới danh sách yêu cầu...');
        await loadDashboardData();
        setIsRefreshing(false);
    };

    const getFilteredRegistrations = () => {
        if (!registrations) return [];
        
        switch (registrationFilter) {
            case 'active':
                return registrations.filter(reg => reg.trangThai === 'Đang hiệu lực' || reg.active === true);
            case 'expired':
                return registrations.filter(reg => reg.trangThai === 'Hết hạn' || reg.expired === true);
            case 'expiring':
                return registrations.filter(reg => 
                    (reg.trangThai === 'Đang hiệu lực' || reg.active === true) && reg.daysUntilExpiry <= 30
                );
            default:
                return registrations;
        }
    };

    // Handler for showing vehicles
    const handleShowVehicles = () => {
        setCurrentView('vehicles');
    };

    // Handler for showing vehicle registration history
    const handleShowVehicleHistory = (vehicle) => {
        setSelectedVehicle(vehicle);
        
        // Filter registrations for this specific vehicle
        const vehicleRegs = registrations ? registrations.filter(reg => reg.bienSoXe === vehicle.bienSoXe) : [];
        setVehicleRegistrations(vehicleRegs);
        setCurrentView('vehicle-history');
    };

    // Handler for going back to dashboard
    const handleBackToDashboard = () => {
        setCurrentView('dashboard');
        setSelectedVehicle(null);
        setVehicleRegistrations([]);
    };

    // Handler for going back to vehicles list
    const handleBackToVehicles = () => {
        setCurrentView('vehicles');
        setSelectedVehicle(null);
        setVehicleRegistrations([]);
    };

    // Handler for showing create vehicle modal
    const handleShowCreateVehicle = () => {
        setIsCreateVehicleModalOpen(true);
    };

    // Handler for create vehicle success
    const handleCreateVehicleSuccess = () => {
        setIsCreateVehicleModalOpen(false);
        
        // Show success notification
        toast?.showSuccess(
            'Tạo xe mới thành công!',
            'Thành công!',
            'Xe đã được thêm vào danh sách của bạn.'
        );
        
        // Reload dashboard to update data
        loadDashboardData();
    };

    // Handler for showing create registration modal
    const handleShowCreateRegistration = (vehicle = null) => {
        setSelectedVehicleForRegistration(vehicle);
        setIsCreateRegistrationModalOpen(true);
    };

    // Handler for create registration success
    const handleCreateRegistrationSuccess = () => {
        setIsCreateRegistrationModalOpen(false);
        setSelectedVehicleForRegistration(null);
        
        // Show success notification
        toast?.showSuccess(
            'Yêu cầu đăng ký tháng đã được gửi thành công!',
            'Thành công!',
            'Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.'
        );
        
        // Reload dashboard to update data
        loadDashboardData();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-900 mb-4">{error}</p>
                    <button 
                        onClick={loadDashboardData}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    // Debug logs to understand data structure 
    console.log('🔍 UserDashboard dashboardData:', dashboardData);
    
    // Extract data according to actual API response structure
    const { userInfo, summary, vehicles, dangKyThangs } = dashboardData || {};
    const registrations = dangKyThangs || []; // Map dangKyThangs to registrations
    const pendingExtensions = dangKyThangs?.filter(reg => reg.trangThai === 'Chờ xử lý') || [];
    
    console.log('🔍 Extracted data:', { userInfo, summary, vehicles, registrations, pendingExtensions });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mr-3">
                                <span className="font-bold text-sm">🅿️</span>
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900">SM Parking - Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleRefreshRequests}
                                disabled={isRefreshing}
                                className={`text-gray-600 hover:text-blue-600 transition-colors ${
                                    isRefreshing ? 'animate-spin' : ''
                                }`}
                                title="Làm mới"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            <div className="text-sm text-gray-600">
                                Xin chào, <span className="font-medium">{userData?.name || userInfo?.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{summary?.totalVehicles || 0}</p>
                                <p className="text-gray-600 text-sm">Tổng xe</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{summary?.activeRegistrations || 0}</p>
                                <p className="text-gray-600 text-sm">Đang hoạt động</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="bg-yellow-100 text-yellow-600 w-12 h-12 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{summary?.expiredRegistrations || 0}</p>
                                <p className="text-gray-600 text-sm">Đã hết hạn</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">
                                    {summary?.totalAmountPaid ? `${summary.totalAmountPaid.toLocaleString('vi-VN')}đ` : '0đ'}
                                </p>
                                <p className="text-gray-600 text-sm">Tổng tiền đã trả</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Requests */}
                {pendingExtensions && pendingExtensions.length > 0 && (
                    <div className="mb-8">
                        <PendingRequestList 
                            pendingRequests={pendingExtensions}
                            onRefresh={handleRefreshRequests}
                            isLoading={isRefreshing}
                        />
                    </div>
                )}

                {/* Dynamic Content Based on Current View */}
                {currentView === 'dashboard' && (
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Quản lý xe của bạn</h2>
                            <button
                                onClick={handleShowVehicles}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Xe của tôi
                            </button>
                        </div>
                        
                        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-lg">Quản lý thông tin xe của bạn</p>
                            <p className="text-gray-400 text-sm mt-1">
                                Click vào "Xe của tôi" để xem danh sách xe và lịch sử đăng ký tháng
                            </p>
                        </div>
                    </div>
                )}

                {currentView === 'vehicles' && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <button
                                    onClick={handleBackToDashboard}
                                    className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h2 className="text-lg font-semibold text-gray-900">Danh sách xe của bạn</h2>
                            </div>
                            
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => handleShowCreateRegistration()}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Đăng ký tháng
                                </button>
                                <button
                                    onClick={handleShowCreateVehicle}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Tạo xe mới
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vehicles && vehicles.length > 0 ? vehicles.map((vehicle) => (
                                <div key={vehicle.bienSoXe} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{vehicle.bienSoXe}</h3>
                                            <p className="text-sm text-gray-600">{vehicle.tenXe}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Loại xe:</span>
                                            <span className="font-medium">{vehicle.tenLoaiXe}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Trạng thái:</span>
                                            <span className={`font-medium ${vehicle.hasActiveDangKy ? 'text-green-600' : 'text-red-600'}`}>
                                                {vehicle.hasActiveDangKy ? 'Đang hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </div>
                                        {vehicle.hasActiveDangKy && vehicle.dangKyExpiry && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Hết hạn:</span>
                                                <span className="font-medium">{new Date(vehicle.dangKyExpiry).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleShowVehicleHistory(vehicle)}
                                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Lịch sử
                                        </button>
                                        
                                        {!vehicle.hasActiveDangKy && (
                                            <button
                                                onClick={() => handleShowCreateRegistration(vehicle)}
                                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Đăng ký
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full text-center py-12">
                                    <div className="text-gray-400 mb-4">
                                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-lg">Không có xe nào</p>
                                    <p className="text-gray-400 text-sm mt-1">Bạn chưa đăng ký xe nào trong hệ thống</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {currentView === 'vehicle-history' && selectedVehicle && (
                    <div className="mb-8">
                        <div className="flex items-center mb-6">
                            <button
                                onClick={handleBackToVehicles}
                                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Lịch sử đăng ký tháng</h2>
                                <p className="text-sm text-gray-600">{selectedVehicle.bienSoXe} - {selectedVehicle.tenXe}</p>
                            </div>
                        </div>
                        
                        {/* Filter Tabs */}
                        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
                            {[
                                { key: 'all', label: 'Tất cả' },
                                { key: 'active', label: 'Hoạt động' },
                                { key: 'expiring', label: 'Sắp hết hạn' },
                                { key: 'expired', label: 'Hết hạn' }
                            ].map((filter) => (
                                <button
                                    key={filter.key}
                                    onClick={() => setRegistrationFilter(filter.key)}
                                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                        registrationFilter === filter.key
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vehicleRegistrations.filter(reg => {
                                switch (registrationFilter) {
                                    case 'active':
                                        return reg.trangThai === 'Đang hiệu lực' || reg.active === true;
                                    case 'expired':
                                        return reg.trangThai === 'Hết hạn' || reg.expired === true;
                                    case 'expiring':
                                        return (reg.trangThai === 'Đang hiệu lực' || reg.active === true) && reg.daysUntilExpiry <= 30;
                                    default:
                                        return true;
                                }
                            }).map((registration) => (
                                <RegistrationCard
                                    key={registration.id}
                                    registration={registration}
                                    pendingRequests={pendingExtensions}
                                    onExtensionRequest={handleExtensionRequest}
                                    showDetails={true}
                                />
                            ))}
                        </div>

                        {vehicleRegistrations.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                <div className="text-gray-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-lg">Không có đăng ký nào</p>
                                <p className="text-gray-400 text-sm mt-1">Xe này chưa có lịch sử đăng ký tháng nào</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Extension Request Modal */}
            {isExtensionModalOpen && selectedRegistration && (
                <ExtensionRequestModal
                    isOpen={isExtensionModalOpen}
                    onClose={() => {
                        setIsExtensionModalOpen(false);
                        setSelectedRegistration(null);
                    }}
                    selectedRegistration={selectedRegistration}
                    onSuccess={handleExtensionSuccess}
                />
            )}

            {/* Create Vehicle Modal */}
            {isCreateVehicleModalOpen && (
                <CreateVehicleModal
                    isOpen={isCreateVehicleModalOpen}
                    onClose={() => setIsCreateVehicleModalOpen(false)}
                    onSuccess={handleCreateVehicleSuccess}
                    vehicleTypes={DEV_CONFIG.MOCK_VEHICLE_TYPES}
                />
            )}

            {/* Create Monthly Registration Modal */}
            {isCreateRegistrationModalOpen && (
                <CreateMonthlyRegistrationModal
                    isOpen={isCreateRegistrationModalOpen}
                    onClose={() => {
                        setIsCreateRegistrationModalOpen(false);
                        setSelectedVehicleForRegistration(null);
                    }}
                    onSuccess={handleCreateRegistrationSuccess}
                    selectedVehicle={selectedVehicleForRegistration}
                    userVehicles={vehicles || []}
                />
            )}
        </div>
    );
};

export default UserDashboardPage;