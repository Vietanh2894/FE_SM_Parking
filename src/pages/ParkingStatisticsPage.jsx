import React, { useState, useEffect } from 'react';
import DashboardNavigation from '../components/DashboardNavigation';
import parkingTransactionService from '../services/parkingTransactionService';
import Toast from '../components/common/Toast';

const ParkingStatisticsPage = () => {
    const [dateRange, setDateRange] = useState({
        startDate: new Date().toISOString().split('T')[0], // Today
        endDate: new Date().toISOString().split('T')[0]    // Today
    });
    const [revenueStats, setRevenueStats] = useState([]);
    const [vehicleCountStats, setVehicleCountStats] = useState([]);
    const [todayTransactions, setTodayTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    useEffect(() => {
        // Load today's data by default
        fetchStatistics();
        fetchTodayTransactions();
    }, []);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    const fetchStatistics = async () => {
        setLoading(true);
        try {
            // Fetch revenue statistics
            const revenueResult = await parkingTransactionService.getRevenueStatistics(
                dateRange.startDate, 
                dateRange.endDate
            );
            
            if (revenueResult.success) {
                setRevenueStats(revenueResult.data || []);
            }

            // Fetch vehicle count statistics
            const vehicleResult = await parkingTransactionService.getVehicleCountStatistics(
                dateRange.startDate, 
                dateRange.endDate
            );
            
            if (vehicleResult.success) {
                setVehicleCountStats(vehicleResult.data || []);
            }

        } catch (error) {
            console.error('Error fetching statistics:', error);
            showNotification('Lỗi khi tải thống kê', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchTodayTransactions = async () => {
        try {
            const result = await parkingTransactionService.getTodayCompletedTransactions();
            if (result.success) {
                setTodayTransactions(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching today transactions:', error);
        }
    };

    const handleDateRangeChange = (field, value) => {
        setDateRange(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApplyDateRange = () => {
        fetchStatistics();
    };

    const setQuickDateRange = (days) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        setDateRange({
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        });
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0 VNĐ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return '';
        return new Date(dateTime).toLocaleString('vi-VN');
    };

    const calculateTotalRevenue = () => {
        return revenueStats.reduce((total, item) => total + (Number(item[1]) || 0), 0);
    };

    const calculateTotalVehicles = () => {
        return vehicleCountStats.reduce((total, item) => total + (Number(item[1]) || 0), 0);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardNavigation />
            
            {/* Toast Notification */}
            {notification.message && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ message: '', type: '' })}
                />
            )}

            <div className="ml-64 flex-1 p-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                        <span className="text-4xl">📊</span>
                        Thống kê đỗ xe
                    </h1>
                    <p className="text-gray-600">
                        Báo cáo doanh thu và số lượng xe theo thời gian
                    </p>
                </div>

                {/* Date Range Controls */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Chọn khoảng thời gian</h3>
                    
                    {/* Quick Date Buttons */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        <button
                            onClick={() => setQuickDateRange(0)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
                        >
                            Hôm nay
                        </button>
                        <button
                            onClick={() => setQuickDateRange(7)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
                        >
                            7 ngày qua
                        </button>
                        <button
                            onClick={() => setQuickDateRange(30)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
                        >
                            30 ngày qua
                        </button>
                    </div>

                    {/* Custom Date Range */}
                    <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Từ ngày
                            </label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Đến ngày
                            </label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handleApplyDateRange}
                            disabled={loading}
                            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Đang tải...
                                </>
                            ) : (
                                <>
                                    📊 Xem thống kê
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Tổng doanh thu</p>
                                <p className="text-2xl font-bold">{formatCurrency(calculateTotalRevenue())}</p>
                            </div>
                            <span className="text-3xl">💰</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Tổng lượt xe</p>
                                <p className="text-2xl font-bold">{calculateTotalVehicles()}</p>
                            </div>
                            <span className="text-3xl">🚗</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Hoàn thành hôm nay</p>
                                <p className="text-2xl font-bold">{todayTransactions.length}</p>
                            </div>
                            <span className="text-3xl">✅</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Doanh thu TB/xe</p>
                                <p className="text-2xl font-bold">
                                    {calculateTotalVehicles() > 0 
                                        ? formatCurrency(calculateTotalRevenue() / calculateTotalVehicles())
                                        : '0 VNĐ'
                                    }
                                </p>
                            </div>
                            <span className="text-3xl">📈</span>
                        </div>
                    </div>
                </div>

                {/* Statistics Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Revenue Statistics */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                💰 Doanh thu theo ngày
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            {revenueStats.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="text-4xl mb-2 block">📊</span>
                                    <p className="text-gray-600">Không có dữ liệu doanh thu</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Ngày
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                Doanh thu
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {revenueStats.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(item[0]).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                                                    {formatCurrency(item[1])}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Vehicle Count Statistics */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                🚗 Số lượt xe theo loại
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            {vehicleCountStats.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="text-4xl mb-2 block">🚗</span>
                                    <p className="text-gray-600">Không có dữ liệu số lượt xe</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Loại xe
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                Số lượt
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {vehicleCountStats.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item[0]}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-blue-600">
                                                    {item[1]}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Today's Completed Transactions */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            ✅ Giao dịch hoàn thành hôm nay ({todayTransactions.length})
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        {todayTransactions.length === 0 ? (
                            <div className="text-center py-8">
                                <span className="text-4xl mb-2 block">✅</span>
                                <p className="text-gray-600">Chưa có giao dịch nào hoàn thành hôm nay</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Mã GD
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Biển số xe
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Bãi đỗ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Thời gian
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Thanh toán
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {todayTransactions.slice(0, 10).map((transaction) => (
                                        <tr key={transaction.maGiaoDich} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{transaction.maGiaoDich}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {transaction.bienSoXe}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {transaction.parkingLot?.tenBaiDo}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDateTime(transaction.thoiGianRa)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                                                {formatCurrency(transaction.soTienThanhToan)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {todayTransactions.length > 10 && (
                            <div className="px-6 py-3 bg-gray-50 text-center text-sm text-gray-500">
                                Và {todayTransactions.length - 10} giao dịch khác...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParkingStatisticsPage;
