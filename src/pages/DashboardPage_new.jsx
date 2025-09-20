import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardNavigation from '../components/DashboardNavigation';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dashboardData, setDashboardData] = useState({
        totalUsers: 0,
        totalVehicles: 0,
        totalStaff: 0,
        totalRoles: 0,
        totalAccounts: 0,
        totalParkingLots: 0,
        totalVehicleTypes: 0,
        totalActiveParkingModes: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [systemStats, setSystemStats] = useState({
        activeUsers: 0,
        activeStaff: 0,
        totalMotorbikesParked: 0,
        totalCarsParked: 0,
        totalVehiclesInAllParkingLots: 0
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Không tìm thấy token xác thực');
                setLoading(false);
                return;
            }

            // Fetch data from all endpoints with proper error handling
            const fetchPromises = [
                axios.get('http://localhost:8080/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).catch(err => {
                    console.log('Users API failed:', err.message);
                    return { data: { data: [] } };
                }),
                axios.get('http://localhost:8080/vehicles', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).catch(err => {
                    console.log('Vehicles API failed:', err.message);
                    return { data: { data: [] } };
                }),
                axios.get('http://localhost:8080/staff', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).catch(err => {
                    console.log('Staff API failed:', err.message);
                    return { data: { data: [] } };
                }),
                axios.get('http://localhost:8080/roles', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).catch(err => {
                    console.log('Roles API failed:', err.message);
                    return { data: { data: [] } };
                }),
                axios.get('http://localhost:8080/accounts', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).catch(err => {
                    console.log('Accounts API failed:', err.message);
                    return { data: { data: [] } };
                }),
                axios.get('http://localhost:8080/parking-lots', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).catch(err => {
                    console.log('Parking Lots API failed:', err.message);
                    return { data: { data: [] } };
                })
            ];

            const [
                usersRes,
                vehiclesRes,
                staffRes,
                rolesRes,
                accountsRes,
                parkingLotsRes
            ] = await Promise.all(fetchPromises);

            console.log('API Responses:', {
                users: usersRes.data,
                vehicles: vehiclesRes.data,
                staff: staffRes.data,
                roles: rolesRes.data,
                accounts: accountsRes.data,
                parkingLots: parkingLotsRes.data
            });

            // Process results safely
            const userData = Array.isArray(usersRes.data?.data) ? usersRes.data.data : [];
            const vehicleData = Array.isArray(vehiclesRes.data?.data) ? vehiclesRes.data.data : [];
            const staffData = Array.isArray(staffRes.data?.data) ? staffRes.data.data : [];
            const rolesData = Array.isArray(rolesRes.data?.data) ? rolesRes.data.data : [];
            const accountsData = Array.isArray(accountsRes.data?.data) ? accountsRes.data.data : [];
            const parkingLotsData = Array.isArray(parkingLotsRes.data?.data) ? parkingLotsRes.data.data : [];

            console.log('Processed data:', {
                userData: userData.length,
                vehicleData: vehicleData.length,
                staffData: staffData.length,
                rolesData: rolesData.length,
                accountsData: accountsData.length,
                parkingLotsData: parkingLotsData.length
            });

            setDashboardData({
                totalUsers: userData.length,
                totalVehicles: vehicleData.length,
                totalStaff: staffData.length,
                totalRoles: rolesData.length,
                totalAccounts: accountsData.length,
                totalParkingLots: parkingLotsData.length,
                totalVehicleTypes: 0,
                totalActiveParkingModes: 0
            });

            // Calculate actual vehicles parked based on parking lots capacity
            const motorbikesInParkingLots = parkingLotsData
                .filter(lot => lot.maLoaiXe?.tenLoaiXe === 'Xe máy')
                .reduce((total, lot) => total + (lot.tongSoCho - lot.soChoTrong), 0);

            const carsInParkingLots = parkingLotsData
                .filter(lot => lot.maLoaiXe?.tenLoaiXe === 'Xe ô tô')
                .reduce((total, lot) => total + (lot.tongSoCho - lot.soChoTrong), 0);

            const totalVehiclesInParkingLots = motorbikesInParkingLots + carsInParkingLots;

            console.log('Vehicle classification:', {
                totalVehicles: vehicleData.length,
                parkingLotStats: {
                    motorbikesInLots: motorbikesInParkingLots,
                    carsInLots: carsInParkingLots,
                    totalInLots: totalVehiclesInParkingLots
                },
                parkingCalculation: `In Lots - Xe máy: ${motorbikesInParkingLots} + Xe ô tô: ${carsInParkingLots} = ${totalVehiclesInParkingLots}`
            });
            
            setSystemStats({
                activeUsers: userData.filter(user => user.account?.trangThai === 'ENABLE').length,
                activeStaff: staffData.filter(staff => staff.account?.trangThai === 'ENABLE').length,
                totalMotorbikesParked: motorbikesInParkingLots,
                totalCarsParked: carsInParkingLots,
                totalVehiclesInAllParkingLots: totalVehiclesInParkingLots
            });

            // Mock recent activity
            setRecentActivity([
                {
                    id: 1,
                    action: 'Thêm nhân viên mới',
                    user: user?.username || 'admin',
                    time: '5 phút trước',
                    type: 'create',
                    icon: '👤'
                },
                {
                    id: 2,
                    action: 'Cập nhật thông tin xe',
                    user: 'staff_001',
                    time: '15 phút trước',
                    type: 'update',
                    icon: '🚗'
                },
                {
                    id: 3,
                    action: 'Xóa tài khoản không hoạt động',
                    user: user?.username || 'admin',
                    time: '30 phút trước',
                    type: 'delete',
                    icon: '❌'
                }
            ]);

            setError('');
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Lỗi khi tải dữ liệu dashboard: ' + error.message);
            
            // Set default values even on error
            setDashboardData({
                totalUsers: 0,
                totalVehicles: 0,
                totalStaff: 0,
                totalRoles: 0,
                totalAccounts: 0,
                totalParkingLots: 0,
                totalVehicleTypes: 0,
                totalActiveParkingModes: 0
            });
            
            setSystemStats({
                activeUsers: 0,
                activeStaff: 0,
                totalMotorbikesParked: 0,
                totalCarsParked: 0,
                totalVehiclesInAllParkingLots: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    const getCurrentDate = () => {
        return new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const quickMenuItems = [
        { icon: '👥', title: 'Quản lý người dùng', path: '/users', color: 'from-blue-500 to-blue-600' },
        { icon: '🚗', title: 'Quản lý xe', path: '/vehicles', color: 'from-green-500 to-green-600' },
        { icon: '👨‍💼', title: 'Quản lý nhân viên', path: '/staff', color: 'from-purple-500 to-purple-600' },
        { icon: '🅿️', title: 'Quản lý bãi đỗ xe', path: '/parking-lots', color: 'from-orange-500 to-orange-600' },
        { icon: '🏷️', title: 'Quản lý chức vụ', path: '/roles', color: 'from-indigo-500 to-indigo-600' },
        { icon: '🔐', title: 'Quản lý tài khoản', path: '/accounts', color: 'from-red-500 to-red-600' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardNavigation />
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardNavigation />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold mb-2">
                                    {getGreeting()}, {user?.hoTen || user?.username || 'Admin'}! 👋
                                </h1>
                                <p className="text-blue-100 text-lg">
                                    {getCurrentDate()}
                                </p>
                                <p className="text-blue-100 mt-2">
                                    Chào mừng bạn đến với hệ thống quản lý bãi đỗ xe thông minh
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <span className="text-6xl">🚗</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Tổng người dùng</p>
                                <p className="text-3xl font-bold text-blue-600">{dashboardData.totalUsers}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl text-blue-600">👥</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Tổng nhân viên</p>
                                <p className="text-3xl font-bold text-green-600">{dashboardData.totalStaff}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl text-green-600">👨‍💼</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Tổng bãi đỗ xe</p>
                                <p className="text-3xl font-bold text-purple-600">{dashboardData.totalParkingLots}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl text-purple-600">🅿️</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Tổng tài khoản</p>
                                <p className="text-3xl font-bold text-pink-600">{dashboardData.totalAccounts}</p>
                            </div>
                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl text-pink-600">🔐</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Tổng số xe máy trong bãi đang đỗ</p>
                                <p className="text-3xl font-bold text-indigo-600">{systemStats.totalMotorbikesParked}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl text-indigo-600">🏍️</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Tổng số xe ô tô trong bãi đang đỗ</p>
                                <p className="text-3xl font-bold text-yellow-600">{systemStats.totalCarsParked}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl text-yellow-600">🚗</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Tổng số xe trong tất cả bãi đỗ</p>
                                <p className="text-3xl font-bold text-red-600">{systemStats.totalVehiclesInAllParkingLots}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl text-red-600">🚙</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Người dùng hoạt động</p>
                                <p className="text-3xl font-bold text-gray-600">{systemStats.activeUsers}</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl text-gray-600">✅</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl">⚡</span>
                            <h2 className="text-xl font-bold text-gray-800">Truy cập nhanh</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {quickMenuItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => window.location.href = item.path}
                                    className={`bg-gradient-to-r ${item.color} hover:scale-105 transform transition-all duration-200 text-white p-4 rounded-lg shadow-md text-center group`}
                                >
                                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">
                                        {item.icon}
                                    </div>
                                    <div className="text-sm font-medium">{item.title}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl">📋</span>
                            <h2 className="text-xl font-bold text-gray-800">Hoạt động gần đây</h2>
                        </div>
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-lg">{activity.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                                        <p className="text-xs text-gray-500">bởi {activity.user} • {activity.time}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        activity.type === 'create' ? 'bg-green-100 text-green-600' :
                                        activity.type === 'update' ? 'bg-blue-100 text-blue-600' :
                                        'bg-red-100 text-red-600'
                                    }`}>
                                        {activity.type === 'create' ? 'Tạo' :
                                         activity.type === 'update' ? 'Cập nhật' : 'Xóa'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
