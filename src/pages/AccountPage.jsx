import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AddAccountModal, EditAccountModal, ConfirmationPopup } from '../components';
import DashboardNavigation from '../components/DashboardNavigation';

// API instance để đồng nhất base URL
const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
});

const AccountPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL'); // New state for stats card filter
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const accountsPerPage = 12;
    
    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        admin: 0,
        baoVe: 0
    });

    useEffect(() => {
        fetchAccounts();
        fetchAccountStats();
    }, [currentPage]);

    useEffect(() => {
        handleFilterAccounts();
    }, [accounts, searchTerm, statusFilter, activeFilter]);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No access token found.');
                return;
            }
            
            const response = await api.get('/accounts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.data && Array.isArray(response.data.data)) {
                setAccounts(response.data.data);
                setError('');
            } else {
                setError('Failed to fetch accounts or data is not an array.');
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            setError('Lỗi khi tải danh sách tài khoản');
        } finally {
            setLoading(false);
        }
    };

    const fetchAccountStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }
            
            // Get basic account count
            const response = await api.get('/accounts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.data && Array.isArray(response.data.data)) {
                const accounts = response.data.data;
                setStats({
                    total: accounts.length,
                    active: accounts.filter(acc => acc.trangThai === 'ENABLE' || acc.active === true).length,
                    inactive: accounts.filter(acc => acc.trangThai === 'DISABLE' || acc.active === false).length,
                    admin: accounts.filter(acc => acc.role && acc.role.roleId === 'ADMIN').length,
                    baoVe: accounts.filter(acc => acc.role && acc.role.roleId === 'BAO_VE').length
                });
            }
        } catch (error) {
            console.error('Error fetching account stats:', error);
        }
    };

    const handleFilterAccounts = () => {
        let filtered = [...accounts];

        // Stats card filter (priority filter)
        if (activeFilter !== 'ALL') {
            switch (activeFilter) {
                case 'ACTIVE':
                    filtered = filtered.filter(account => account.trangThai === 'ENABLE' || account.active === true);
                    break;
                case 'INACTIVE':
                    filtered = filtered.filter(account => account.trangThai === 'DISABLE' || account.active === false);
                    break;
                case 'ADMIN':
                    filtered = filtered.filter(account => account.role?.roleId === 'ADMIN');
                    break;
                case 'BAO_VE':
                    filtered = filtered.filter(account => account.role?.roleId === 'BAO_VE');
                    break;
                default:
                    break;
            }
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(account =>
                account.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.role?.roleName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter (if not using stats card filter)
        if (statusFilter && activeFilter === 'ALL') {
            filtered = filtered.filter(account => 
                statusFilter === 'ALL' || account.trangThai === statusFilter
            );
        }

        setFilteredAccounts(filtered);
    };

    const handleSearch = () => {
        if (searchTerm.trim()) {
            accountService.searchAccounts(searchTerm.trim())
                .then(response => {
                    if (response.success) {
                        setAccounts(response.data);
                        setCurrentPage(1);
                    }
                })
                .catch(error => console.error('Search error:', error));
        } else {
            fetchAccounts();
        }
    };

    const handleAddAccount = () => {
        setShowAddModal(true);
    };

    const handleEditAccount = (account) => {
        setSelectedAccount(account);
        setShowEditModal(true);
    };

    const handleDeleteAccount = (account) => {
        setSelectedAccount(account);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteAccount = async () => {
        if (!selectedAccount) return;

        try {
            const token = localStorage.getItem('token');
            const response = await api.delete(`/accounts/${selectedAccount.username}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.status === 200) {
                await fetchAccounts();
                await fetchAccountStats();
                setShowDeleteConfirm(false);
                setSelectedAccount(null);
                alert('Xóa tài khoản thành công!');
            } else {
                alert('Lỗi khi xóa tài khoản');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Lỗi khi xóa tài khoản');
        }
    };

    // Handle stats card click
    const handleStatsCardClick = (filterType) => {
        setActiveFilter(filterType);
        setCurrentPage(1); // Reset to first page when filtering
    };

    const handleAccountAdded = () => {
        fetchAccounts();
        fetchAccountStats();
        setShowAddModal(false);
    };

    const handleAccountUpdated = () => {
        fetchAccounts();
        fetchAccountStats();
        setShowEditModal(false);
        setSelectedAccount(null);
    };

    const getStatusBadge = (status, active) => {
        // Priority: use active boolean if available, fallback to trangThai
        const isActive = active !== undefined ? active : (status === 'ENABLE');
        
        if (isActive) {
            return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">✅ Hoạt động</span>;
        } else {
            return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">🚫 Bị khóa</span>;
        }
    };

    const getRoleBadge = (roleId) => {
        switch (roleId) {
            case 'ADMIN':
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">🛡️ Admin</span>;
            case 'BAO_VE':
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">🛡️ Bảo vệ</span>;
            case 'USER':
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">👤 User</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">❓ Chưa xác định</span>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit'
        });
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderPagination = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
                >
                    {i}
                </button>
            );
        }

        return pages;
    };

    if (loading) {
        return (
            <>
                <DashboardNavigation />
                <div className="ml-64 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="flex items-center justify-center h-screen">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                            <p className="text-lg text-gray-600 font-medium">Đang tải danh sách tài khoản...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <DashboardNavigation />
            <div className="ml-64 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="p-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                                    <span className="text-4xl">👤</span>
                                    Quản lý tài khoản
                                </h1>
                                <p className="text-gray-600">Quản lý tài khoản người dùng và phân quyền hệ thống</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <div 
                            className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 cursor-pointer transform transition-all duration-200 hover:scale-105 ${activeFilter === 'ALL' ? 'ring-2 ring-purple-300 shadow-xl' : ''}`}
                            onClick={() => handleStatsCardClick('ALL')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Tổng tài khoản</p>
                                    <p className="text-3xl font-bold text-purple-600">{stats.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl text-purple-600">👥</span>
                                </div>
                            </div>
                        </div>
                        
                        <div 
                            className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 cursor-pointer transform transition-all duration-200 hover:scale-105 ${activeFilter === 'ACTIVE' ? 'ring-2 ring-green-300 shadow-xl' : ''}`}
                            onClick={() => handleStatsCardClick('ACTIVE')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Đang hoạt động</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl text-green-600">✅</span>
                                </div>
                            </div>
                        </div>
                        
                        <div 
                            className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 cursor-pointer transform transition-all duration-200 hover:scale-105 ${activeFilter === 'INACTIVE' ? 'ring-2 ring-red-300 shadow-xl' : ''}`}
                            onClick={() => handleStatsCardClick('INACTIVE')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Bị khóa</p>
                                    <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl text-red-600">🚫</span>
                                </div>
                            </div>
                        </div>
                        
                        <div 
                            className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 cursor-pointer transform transition-all duration-200 hover:scale-105 ${activeFilter === 'ADMIN' ? 'ring-2 ring-blue-300 shadow-xl' : ''}`}
                            onClick={() => handleStatsCardClick('ADMIN')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Quản trị viên</p>
                                    <p className="text-3xl font-bold text-blue-600">{stats.admin}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl text-blue-600">🛡️</span>
                                </div>
                            </div>
                        </div>

                        <div 
                            className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 cursor-pointer transform transition-all duration-200 hover:scale-105 ${activeFilter === 'BAO_VE' ? 'ring-2 ring-yellow-300 shadow-xl' : ''}`}
                            onClick={() => handleStatsCardClick('BAO_VE')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Bảo vệ</p>
                                    <p className="text-3xl font-bold text-yellow-600">{stats.baoVe}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl text-yellow-600">🛡️</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-center">
                            <div className="flex-1 w-full lg:w-auto">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder=" Tìm kiếm theo tên đăng nhập hoặc vai trò..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-xl">🔍</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="ENABLE">Đang hoạt động</option>
                                    <option value="DISABLE">Bị khóa</option>
                                </select>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('');
                                        setActiveFilter('ALL');
                                        setCurrentPage(1);
                                        fetchAccounts(); // Refresh data
                                    }}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                                >
                                    <span>🔄</span>
                                    Làm mới
                                </button>
                                <button
                                    onClick={handleAddAccount}
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                                >
                                    <span className="text-lg">➕</span>
                                    Thêm tài khoản
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg shadow-md bg-red-100 text-red-800 border border-red-200">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">❌</span>
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Accounts Grid */}
                    {filteredAccounts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {filteredAccounts.map((account, index) => (
                                <div key={account.username || index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:scale-105 border border-gray-100">
                                    {/* Account Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
                                            account.role?.roleId === 'ADMIN' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                            account.role?.roleId === 'BAO_VE' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                            'bg-gradient-to-r from-purple-500 to-purple-600'
                                        }`}>
                                            {account.role?.roleId === 'ADMIN' ? '🛡️' : 
                                             account.role?.roleId === 'BAO_VE' ? '👮' : '👤'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                                                {account.username}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {account.role?.roleId === 'ADMIN' ? 'Quản trị viên' :
                                                 account.role?.roleId === 'BAO_VE' ? 'Nhân viên bảo vệ' : 'Người dùng'}
                                            </p>
                                        </div>
                                        {getRoleBadge(account.role?.roleId)}
                                    </div>

                                    {/* Account Details */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">�</span>
                                            <span className="text-gray-700">{account.role?.roleName || 'Chưa xác định'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">�</span>
                                            <span className="text-gray-700 text-xs">Tạo: {formatDate(account.createdDate)}</span>
                                        </div>
                                        {account.updatedDate && account.updatedDate !== account.createdDate && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-400">�</span>
                                                <span className="text-gray-700 text-xs">Cập nhật: {formatDate(account.updatedDate)}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">⚡</span>
                                            {getStatusBadge(account.trangThai, account.active)}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleEditAccount(account)}
                                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1"
                                            title="Chỉnh sửa"
                                        >
                                            ✏️ Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAccount(account)}
                                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1"
                                            title="Xóa"
                                        >
                                            🗑️ Xóa
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">👤</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy tài khoản</h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm || statusFilter || activeFilter !== 'ALL' ? 
                                    'Không có tài khoản nào phù hợp với tiêu chí tìm kiếm' : 
                                    'Chưa có tài khoản nào trong hệ thống'
                                }
                            </p>
                            {!searchTerm && !statusFilter && activeFilter === 'ALL' && (
                                <button
                                    onClick={handleAddAccount}
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                                >
                                    ➕ Thêm tài khoản đầu tiên
                                </button>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 bg-white rounded-lg shadow-md p-4">
                            <div className="text-sm text-gray-600">
                                Hiển thị {((currentPage - 1) * accountsPerPage) + 1} - {Math.min(currentPage * accountsPerPage, filteredAccounts.length)} trong tổng số {filteredAccounts.length} tài khoản
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← Trước
                                </button>
                                
                                {renderPagination().map((page, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handlePageChange(page.props.children)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                            currentPage === page.props.children 
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                                                : 'text-blue-600 bg-white border border-blue-300 hover:bg-blue-50'
                                        }`}
                                    >
                                        {page.props.children}
                                    </button>
                                ))}
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Tiếp →
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modals */}
                {showAddModal && (
                    <AddAccountModal
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        onAccountAdded={handleAccountAdded}
                    />
                )}

                {showEditModal && selectedAccount && (
                    <EditAccountModal
                        isOpen={showEditModal}
                        onClose={() => {
                            setShowEditModal(false);
                            setSelectedAccount(null);
                        }}
                        onAccountUpdated={handleAccountUpdated}
                        account={selectedAccount}
                    />
                )}

                {showDeleteConfirm && selectedAccount && (
                    <ConfirmationPopup
                        isOpen={showDeleteConfirm}
                        title="Xác nhận xóa tài khoản"
                        message={`Bạn có chắc chắn muốn xóa tài khoản "${selectedAccount.username}"? Hành động này không thể hoàn tác.`}
                        onConfirm={confirmDeleteAccount}
                        onCancel={() => {
                            setShowDeleteConfirm(false);
                            setSelectedAccount(null);
                        }}
                        confirmText="Xóa"
                        cancelText="Hủy"
                        type="danger"
                    />
                )}
            </div>
        </>
    );
};

export default AccountPage;
