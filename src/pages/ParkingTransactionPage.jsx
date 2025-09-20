import React, { useState, useEffect } from 'react';
import { 
    MagnifyingGlassIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon,
    PlusIcon,
    DocumentTextIcon,
    ClockIcon,
    CurrencyDollarIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../layouts/DashboardLayout';
import VehicleStatusModal from '../components/modals/VehicleStatusModal';
import VehicleEntryModal from '../components/modals/VehicleEntryModal';
import VehicleExitModal from '../components/modals/VehicleExitModal';
import Toast from '../components/common/Toast';
import { parkingTransactionService } from '../services/parkingTransactionService';

const ParkingTransactionPage = () => {
    // States for modals
    const [isVehicleStatusModalOpen, setIsVehicleStatusModalOpen] = useState(false);
    const [isVehicleEntryModalOpen, setIsVehicleEntryModalOpen] = useState(false);
    const [isVehicleExitModalOpen, setIsVehicleExitModalOpen] = useState(false);

    // States for data
    const [transactions, setTransactions] = useState([]);
    const [statistics, setStatistics] = useState({
        totalTransactions: 0,
        totalVehiclesInside: 0,
        totalRevenue: 0,
        occupancyRate: 0
    });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    // Toast state
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const hideToast = () => {
        setToast(null);
    };

    // Fetch transactions
    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await parkingTransactionService.getAllTransactions({
                page: currentPage - 1,
                size: itemsPerPage,
                search: searchTerm
            });
            
            if (response.success) {
                setTransactions(response.data.content || []);
                setTotalPages(response.data.totalPages || 1);
            } else {
                showToast('Không thể tải danh sách giao dịch', 'error');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            showToast('Có lỗi xảy ra khi tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics
    const fetchStatistics = async () => {
        try {
            const response = await parkingTransactionService.getStatistics();
            if (response.success) {
                setStatistics(response.data);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    useEffect(() => {
        fetchTransactions();
        fetchStatistics();
    }, [currentPage, searchTerm]);

    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString('vi-VN');
    };

    const getStatusColor = (status) => {
        return parkingTransactionService.getStatusColor(status);
    };

    const getStatusText = (status) => {
        return parkingTransactionService.getStatusText(status);
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý Giao dịch Đỗ xe</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Theo dõi và quản lý các giao dịch vào/ra bãi đỗ xe
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Tổng giao dịch
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {statistics.totalTransactions}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <UserGroupIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Xe trong bãi
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {statistics.totalVehiclesInside}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Doanh thu
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {formatCurrency(statistics.totalRevenue)}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <ClockIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Tỷ lệ lấp đầy
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {statistics.occupancyRate}%
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mb-6 flex flex-wrap gap-4">
                        <button
                            onClick={() => setIsVehicleStatusModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                            Kiểm tra xe
                        </button>
                        
                        <button
                            onClick={() => setIsVehicleEntryModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Xe vào bãi
                        </button>
                        
                        <button
                            onClick={() => setIsVehicleExitModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Xe ra bãi
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                                        Tìm kiếm
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="search"
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                            placeholder="Tìm theo biển số xe..."
                                            value={searchTerm}
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Danh sách giao dịch
                                </h3>
                            </div>

                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Biển số xe
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Loại xe
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Bãi đỗ
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Thời gian
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Loại giao dịch
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Phí
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Trạng thái
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {transactions.length > 0 ? (
                                                transactions.map((transaction) => (
                                                    <tr key={transaction.maGiaoDich} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {transaction.bienSoXe}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {transaction.vehicleType?.tenLoaiXe || transaction.vehicleType?.maLoaiXe || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {transaction.parkingLot?.tenBaiDo || transaction.parkingLot?.maBaiDo || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDateTime(transaction.thoiGianVao)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {getStatusText(transaction.trangThai)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {transaction.soTienThanhToan ? formatCurrency(transaction.soTienThanhToan) : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.trangThai)}`}>
                                                                {getStatusText(transaction.trangThai)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                                        Không có dữ liệu giao dịch
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Trước
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Hiển thị trang <span className="font-medium">{currentPage}</span> trên{' '}
                                                <span className="font-medium">{totalPages}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                <button
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeftIcon className="h-5 w-5" />
                                                </button>
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            page === currentPage
                                                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRightIcon className="h-5 w-5" />
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {isVehicleStatusModalOpen && (
                    <VehicleStatusModal
                        isOpen={isVehicleStatusModalOpen}
                        onClose={() => setIsVehicleStatusModalOpen(false)}
                        onSuccess={() => {
                            fetchTransactions();
                            fetchStatistics();
                            showToast('Kiểm tra trạng thái xe thành công');
                        }}
                        showToast={showToast}
                    />
                )}

                {isVehicleEntryModalOpen && (
                    <VehicleEntryModal
                        isOpen={isVehicleEntryModalOpen}
                        onClose={() => setIsVehicleEntryModalOpen(false)}
                        onSuccess={() => {
                            fetchTransactions();
                            fetchStatistics();
                            showToast('Xe vào bãi thành công');
                        }}
                        showToast={showToast}
                    />
                )}

                {isVehicleExitModalOpen && (
                    <VehicleExitModal
                        isOpen={isVehicleExitModalOpen}
                        onClose={() => setIsVehicleExitModalOpen(false)}
                        onSuccess={() => {
                            fetchTransactions();
                            fetchStatistics();
                            showToast('Xe ra bãi thành công');
                        }}
                        showToast={showToast}
                    />
                )}

                {/* Toast */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default ParkingTransactionPage;