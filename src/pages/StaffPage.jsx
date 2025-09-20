import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddStaffModal from '../components/modals/AddStaffModal';
import EditStaffModal from '../components/modals/EditStaffModal';
import ConfirmationPopup from '../components/common/ConfirmationPopup';
import DashboardNavigation from '../components/DashboardNavigation';

const StaffPage = () => {
    const [staff, setStaff] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const [searchTerm, setSearchTerm] = useState('');
    const [chucVuFilter, setChucVuFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [savingData, setSavingData] = useState(false);

    // Stats
    const [staffStats, setStaffStats] = useState({
        totalAdmin: 0,
        totalBaoVe: 0,
        totalActive: 0
    });

    useEffect(() => {
        fetchStaff();
        fetchStaffStats();
    }, []);

    useEffect(() => {
        handleFilter();
        calculateStatsFromData(); // Recalculate stats when staff data changes
    }, [staff, searchTerm, chucVuFilter, statusFilter]);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/staff', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.data && response.data.data) {
                setStaff(response.data.data);
                setFilteredStaff(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            setError('Không thể tải danh sách nhân viên. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStaffStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/staff/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.data && response.data.data) {
                setStaffStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching staff stats:', error);
            // Calculate stats from existing staff data
            calculateStatsFromData();
        }
    };

    const calculateStatsFromData = () => {
        if (staff.length > 0) {
            const totalAdmin = staff.filter(member => member.chucVu === 'ADMIN').length;
            const totalBaoVe = staff.filter(member => member.chucVu === 'BAO_VE' || member.chucVu === 'BAOVE').length;
            const totalActive = staff.filter(member => member.account?.trangThai === 'ENABLE').length;
            
            setStaffStats({
                totalAdmin,
                totalBaoVe,
                totalActive
            });
        }
    };

    const handleFilter = () => {
        let filtered = [...staff];

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(member =>
                member.hoTen.toLowerCase().includes(searchLower) ||
                member.maNV.toLowerCase().includes(searchLower) ||
                (member.email && member.email.toLowerCase().includes(searchLower)) ||
                (member.sdt && member.sdt.includes(searchTerm)) ||
                (member.cccd && member.cccd.includes(searchTerm))
            );
        }

        // Filter by chuc vu
        if (chucVuFilter) {
            filtered = filtered.filter(member => member.chucVu === chucVuFilter);
        }

        // Filter by status
        if (statusFilter) {
            if (statusFilter === 'ACTIVE') {
                filtered = filtered.filter(member => member.account?.trangThai === 'ENABLE');
            } else if (statusFilter === 'INACTIVE') {
                filtered = filtered.filter(member => !member.account || member.account?.trangThai === 'DISABLE');
            }
        }

        setFilteredStaff(filtered);
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            handleFilter();
        }
    };

    const handleAddStaff = async (staffData) => {
        if (savingData) return;
        
        try {
            setSavingData(true);
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8080/staff', staffData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.status >= 200 && response.status < 300) {
                await fetchStaff();
                await fetchStaffStats();
                setShowAddModal(false);
                setError('');
            }
        } catch (error) {
            console.error('Error adding staff:', error);
            setError('Không thể thêm nhân viên. Vui lòng thử lại.');
        } finally {
            setSavingData(false);
        }
    };

    const handleEditStaff = async (staffData) => {
        if (savingData) return;
        
        try {
            setSavingData(true);
            const token = localStorage.getItem('token');
            
            console.log('Updating staff with data:', staffData);
            console.log('Staff maNV:', selectedStaff.maNV);
            
            const response = await axios.put(`http://localhost:8080/staff`, staffData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Update response:', response);
            
            if (response.status >= 200 && response.status < 300) {
                await fetchStaff();
                await fetchStaffStats();
                setShowEditModal(false);
                setSelectedStaff(null);
                setError('');
            }
        } catch (error) {
            console.error('Error updating staff:', error);
            console.error('Error details:', error.response?.data);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.response?.status === 400) {
                setError('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.');
            } else {
                setError('Không thể cập nhật nhân viên. Vui lòng thử lại.');
            }
        } finally {
            setSavingData(false);
        }
    };

    const handleDeleteStaff = async () => {
        if (savingData) return;
        
        try {
            setSavingData(true);
            const token = localStorage.getItem('token');
            
            console.log('Deleting staff with maNV:', selectedStaff.maNV);
            
            const response = await axios.delete(`http://localhost:8080/staff/${selectedStaff.maNV}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Delete response:', response);
            
            if (response.status >= 200 && response.status < 300) {
                console.log('Staff deleted successfully');
                await fetchStaff();
                await fetchStaffStats();
                setShowDeleteModal(false);
                setSelectedStaff(null);
                setError('');
                // Show success message
                alert('Xóa nhân viên thành công!');
            }
        } catch (error) {
            console.error('Error deleting staff:', error);
            console.error('Error details:', error.response?.data);
            
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.response?.status === 404) {
                setError('Nhân viên không tồn tại hoặc đã bị xóa.');
            } else if (error.response?.status === 400) {
                setError('Không thể xóa nhân viên. Có thể nhân viên đang được sử dụng trong hệ thống.');
            } else if (error.response?.status === 403) {
                setError('Bạn không có quyền xóa nhân viên này.');
            } else {
                setError('Không thể xóa nhân viên. Vui lòng thử lại.');
            }
        } finally {
            setSavingData(false);
        }
    };

    const openEditModal = (staffMember) => {
        setSelectedStaff(staffMember);
        setShowEditModal(true);
    };

    const openDeleteModal = (staffMember) => {
        setSelectedStaff(staffMember);
        setShowDeleteModal(true);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Helper functions for styling
    const getChucVuClass = (chucVu) => {
        switch (chucVu) {
            case 'ADMIN': return 'bg-purple-100 text-purple-800';
            case 'BAO_VE':
            case 'BAOVE': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getChucVuDisplay = (chucVu) => {
        switch (chucVu) {
            case 'ADMIN': return 'Quản trị viên';
            case 'BAO_VE': return 'Bảo vệ';
            case 'BAOVE': return 'Bảo vệ'; // Backward compatibility
            default: return 'Chưa xác định';
        }
    };

    const getAccountStatus = (account) => {
        if (!account) {
            return { text: 'Chưa có tài khoản', class: 'bg-gray-100 text-gray-800' };
        }
        if (account.trangThai === 'ENABLE') {
            return { text: 'Đang hoạt động', class: 'bg-green-100 text-green-800' };
        }
        return { text: 'Ngưng hoạt động', class: 'bg-red-100 text-red-800' };
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

    if (loading) {
        return (
            <>
                <DashboardNavigation />
                <div className="ml-64 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="flex items-center justify-center h-screen">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                            <p className="text-lg text-gray-600 font-medium">Đang tải dữ liệu nhân viên...</p>
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
                                    <span className="text-4xl">👥</span>
                                    Quản lý nhân viên
                                </h1>
                                <p className="text-gray-600">Quản lý thông tin nhân viên và tài khoản trong hệ thống</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                            >
                                <span className="text-lg">➕</span>
                                Thêm nhân viên
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Quản trị viên</p>
                                    <p className="text-3xl font-bold text-blue-600">{staffStats.totalAdmin}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl text-blue-600">🛡️</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Bảo vệ</p>
                                    <p className="text-3xl font-bold text-yellow-600">{staffStats.totalBaoVe}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl text-yellow-600">🔒</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Đang hoạt động</p>
                                    <p className="text-3xl font-bold text-green-600">{staffStats.totalActive}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl text-green-600">✅</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Tổng nhân viên</p>
                                    <p className="text-3xl font-bold text-purple-600">{staff.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl text-purple-600">👥</span>
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
                                        placeholder="🔍 Tìm kiếm theo tên, mã nhân viên, email, SĐT hoặc CCCD..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={handleSearch}
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-xl">🔍</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <select
                                    value={chucVuFilter}
                                    onChange={(e) => setChucVuFilter(e.target.value)}
                                    className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                                >
                                    <option value="">Tất cả chức vụ</option>
                                    <option value="ADMIN">Quản trị viên</option>
                                    <option value="BAO_VE">Bảo vệ</option>
                                    <option value="BAOVE">Bảo vệ (Legacy)</option>
                                </select>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="ACTIVE">Đang hoạt động</option>
                                    <option value="INACTIVE">Ngưng hoạt động</option>
                                </select>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setChucVuFilter('');
                                        setStatusFilter('');
                                        setFilteredStaff(staff);
                                        setCurrentPage(1);
                                    }}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                                >
                                    <span>🔄</span>
                                    Làm mới
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

                    {/* Staff Grid */}
                    {currentItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {currentItems.map((staffMember) => {
                                const accountStatus = getAccountStatus(staffMember.account);
                                return (
                                    <div key={staffMember.maNV} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:scale-105 border border-gray-100">
                                        {/* Staff Header */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                                👤
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                                                    {staffMember.hoTen}
                                                </h3>
                                                <p className="text-sm text-gray-500">#{staffMember.maNV}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getChucVuClass(staffMember.chucVu)}`}>
                                                {getChucVuDisplay(staffMember.chucVu)}
                                            </span>
                                        </div>

                                        {/* Staff Details */}
                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-400">📧</span>
                                                <span className="text-gray-700 truncate">{staffMember.email || 'Chưa cập nhật'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-400">📱</span>
                                                <span className="text-gray-700">{staffMember.sdt || 'Chưa cập nhật'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-400">🆔</span>
                                                <span className="text-gray-700">{staffMember.cccd || 'Chưa cập nhật'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-400">📅</span>
                                                <span className="text-gray-700">
                                                    {staffMember.ngayVaoLam ? new Date(staffMember.ngayVaoLam).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-400">👤</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${accountStatus.class}`}>
                                                    {accountStatus.text}
                                                </span>
                                            </div>
                                            {staffMember.account?.role && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-gray-400">🔑</span>
                                                    <span className="text-gray-700 text-xs">
                                                        Role: {staffMember.account.role.roleName}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-4 border-t border-gray-100">
                                            <button
                                                onClick={() => openEditModal(staffMember)}
                                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1"
                                                title="Chỉnh sửa"
                                            >
                                                ✏️ Sửa
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(staffMember)}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1"
                                                title="Xóa"
                                            >
                                                🗑️ Xóa
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">👥</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy nhân viên</h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm || chucVuFilter || statusFilter ? 
                                    'Không có nhân viên nào phù hợp với tiêu chí tìm kiếm' : 
                                    'Chưa có nhân viên nào trong hệ thống'
                                }
                            </p>
                            {!searchTerm && !chucVuFilter && !statusFilter && (
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                                >
                                    ➕ Thêm nhân viên đầu tiên
                                </button>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 bg-white rounded-lg shadow-md p-4">
                            <div className="text-sm text-gray-600">
                                Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredStaff.length)} trong tổng số {filteredStaff.length} nhân viên
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← Trước
                                </button>
                                
                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => handlePageChange(index + 1)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                            currentPage === index + 1 
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                                                : 'text-blue-600 bg-white border border-blue-300 hover:bg-blue-50'
                                        }`}
                                    >
                                        {index + 1}
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
                    <AddStaffModal
                        isOpen={showAddModal}
                        onSave={handleAddStaff}
                        onClose={() => setShowAddModal(false)}
                        isSubmitting={savingData}
                    />
                )}

                {showEditModal && selectedStaff && (
                    <EditStaffModal
                        isOpen={showEditModal}
                        staff={selectedStaff}
                        onSave={handleEditStaff}
                        onClose={() => {
                            setShowEditModal(false);
                            setSelectedStaff(null);
                        }}
                        isSubmitting={savingData}
                    />
                )}

                {showDeleteModal && selectedStaff && (
                    <ConfirmationPopup
                        isOpen={showDeleteModal}
                        message={`Bạn có chắc chắn muốn xóa nhân viên "${selectedStaff.hoTen}" không?`}
                        onConfirm={handleDeleteStaff}
                        onClose={() => {
                            setShowDeleteModal(false);
                            setSelectedStaff(null);
                        }}
                        isLoading={savingData}
                    />
                )}
            </div>
        </>
    );
};

export default StaffPage;
