import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AddRoleModal, EditRoleModal, ConfirmationPopup } from '../components';
import DashboardNavigation from '../components/DashboardNavigation';

const RolePage = () => {
    const [roles, setRoles] = useState([]);
    const [originalRoles, setOriginalRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchInput, setSearchInput] = useState('');
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.get('http://localhost:8080/roles', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('Roles API response:', response);
            
            // Cập nhật để phù hợp với cấu trúc API mới
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                setRoles(response.data.data);
                setOriginalRoles(response.data.data);
                setError('');
            } else {
                setError('Lỗi khi tải danh sách chức vụ');
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            setError('Lỗi khi tải danh sách chức vụ');
        } finally {
            setLoading(false);
        }
    };

    const handleAddRole = () => {
        setShowAddModal(true);
    };

    const handleRefresh = async () => {
        setSearchInput('');
        await fetchRoles();
    };

    const handleSearch = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setSearchInput(e.target.value);
        
        if (searchTerm.trim() === '') {
            setRoles(originalRoles);
        } else {
            const filtered = originalRoles.filter(role =>
                role.roleId?.toLowerCase().includes(searchTerm) ||
                role.roleName?.toLowerCase().includes(searchTerm)
            );
            setRoles(filtered);
        }
    };

    const handleEditRole = (role) => {
        setSelectedRole(role);
        setShowEditModal(true);
    };

    const handleDeleteRole = (role) => {
        console.log('Delete click for role:', role);
        setSelectedRole(role);
        setShowDeleteConfirm(true);
        console.log('Delete confirmation dialog should show now');
    };

    const confirmDeleteRole = async () => {
        if (!selectedRole) return;

        try {
            setIsDeleting(true);
            const token = localStorage.getItem('token');
            
            console.log('Deleting role:', selectedRole.roleId);
            
            const response = await axios.delete(`http://localhost:8080/roles/${selectedRole.roleId}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Delete response:', response);
            
            if (response.status >= 200 && response.status < 300) {
                await fetchRoles();
                setShowDeleteConfirm(false);
                setSelectedRole(null);
                // Hiển thị thông báo thành công
                const successMessage = `Xóa thành công role "${selectedRole.roleName}" (${selectedRole.roleId})`;
                console.log(successMessage);
                alert(successMessage);
            }
        } catch (error) {
            console.error('Error deleting role:', error);
            console.error('Error details:', error.response?.data);
            
            let errorMessage = 'Lỗi khi xóa role. Vui lòng thử lại.';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 404) {
                errorMessage = 'Role không tồn tại hoặc đã bị xóa.';
            } else if (error.response?.status === 400) {
                errorMessage = 'Không thể xóa role. Có thể role đang được sử dụng trong hệ thống.';
            }
            
            alert(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };
    const handleRoleAdded = async () => {
        await fetchRoles();
        setShowAddModal(false);
    };

    const handleRoleUpdated = async () => {
        await fetchRoles();
        setShowEditModal(false);
        setSelectedRole(null);
    };
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getRoleIcon = (roleName) => {
        switch (roleName?.toLowerCase()) {
            case 'admin':
            case 'quản trị viên':
                return '🛡️';
            case 'bảo vệ':
            case 'bao_ve':
            case 'security':
                return '🔒';
            case 'thu ngân':
            case 'cashier':
                return '💰';
            case 'kỹ thuật':
            case 'technical':
            case 'staff_role':
                return '🔧';
            case 'client_2':
                return '👥';
            default:
                return '👤';
        }
    };

    const getRoleColor = (roleName) => {
        switch (roleName?.toLowerCase()) {
            case 'admin':
            case 'quản trị viên':
                return 'border-blue-500';
            case 'bảo vệ':
            case 'bao_ve':
            case 'security':
                return 'border-yellow-500';
            case 'thu ngân':
            case 'cashier':
                return 'border-green-500';
            case 'kỹ thuật':
            case 'technical':
            case 'staff_role':
                return 'border-purple-500';
            case 'client_2':
                return 'border-pink-500';
            default:
                return 'border-gray-500';
        }
    };

    if (loading) {
        return (
            <>
                <DashboardNavigation />
                <div className="ml-64 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="flex items-center justify-center h-screen">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                            <p className="text-lg text-gray-600 font-medium">Đang tải danh sách chức vụ...</p>
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
                        <div className="flex flex-col gap-6">
                            {/* Title */}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                                    <span className="text-4xl">🏷️</span>
                                    Quản lý chức vụ
                                </h1>
                                <p className="text-gray-600">Quản lý các chức vụ và quyền hạn trong hệ thống</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Tổng chức vụ</p>
                                    <p className="text-3xl font-bold text-purple-600">{roles.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl text-purple-600">🏷️</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Quản trị</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {roles.filter(role => 
                                            role.roleName?.toLowerCase().includes('admin') ||
                                            role.roleName?.toLowerCase().includes('quản trị')
                                        ).length}
                                    </p>
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
                                    <p className="text-3xl font-bold text-yellow-600">
                                        {roles.filter(role => 
                                            role.roleName?.toLowerCase().includes('bảo vệ') ||
                                            role.roleName?.toLowerCase().includes('security')
                                        ).length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl text-yellow-600">🔒</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Khác</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {roles.filter(role => 
                                            !role.roleName?.toLowerCase().includes('admin') &&
                                            !role.roleName?.toLowerCase().includes('quản trị') &&
                                            !role.roleName?.toLowerCase().includes('bảo vệ') &&
                                            !role.roleName?.toLowerCase().includes('security')
                                        ).length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl text-green-600">⚙️</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controls Row */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            {/* Search */}
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo Role ID hoặc tên role..."
                                        value={searchInput}
                                        onChange={handleSearch}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-lg">�</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleRefresh}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                                    title="Làm mới"
                                >
                                    <span className="text-lg">🔄</span>
                                    <span className="hidden sm:inline">Làm mới</span>
                                </button>
                                
                                <button
                                    onClick={handleAddRole}
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                                >
                                    <span className="text-lg">➕</span>
                                    <span className="hidden sm:inline">Thêm role</span>
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

                    {/* Roles Grid */}
                    {roles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {roles.map(role => (
                                <div key={role.roleId} className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:scale-105 border-l-4 ${getRoleColor(role.roleName)}`}>
                                    {/* Role Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl">
                                            {getRoleIcon(role.roleName)}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                                                {role.roleName}
                                            </h3>
                                            <p className="text-sm text-gray-500">#{role.roleId}</p>
                                        </div>
                                    </div>

                                    {/* Role Details */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-start gap-2 text-sm">
                                            <span className="text-gray-400 mt-0.5">🏷️</span>
                                            <span className="text-gray-700 flex-1">
                                                <strong>ID:</strong> {role.roleId}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm">
                                            <span className="text-gray-400 mt-0.5">�</span>
                                            <span className="text-gray-700 flex-1">
                                                <strong>Tên:</strong> {role.roleName}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">�</span>
                                            <span className="text-gray-700">
                                                Chức vụ hệ thống
                                            </span>
                                        </div>
                                    </div>

                                    {/* Role Type Badge */}
                                    <div className="mb-4">
                                        {role.roleId === 'ADMIN' && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                🛡️ Quản trị viên
                                            </span>
                                        )}
                                        {role.roleId === 'BAO_VE' && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                🔒 Bảo vệ
                                            </span>
                                        )}
                                        {role.roleId.startsWith('ROLE_') && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                ⚙️ Role tùy chỉnh
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleEditRole(role)}
                                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1"
                                            title="Chỉnh sửa"
                                        >
                                            ✏️ Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRole(role)}
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
                            <div className="text-6xl mb-4">🏷️</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có chức vụ nào</h3>
                            <p className="text-gray-600 mb-4">
                                Bắt đầu bằng việc tạo chức vụ đầu tiên cho hệ thống
                            </p>
                            <button
                                onClick={handleAddRole}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                            >
                                ➕ Tạo chức vụ đầu tiên
                            </button>
                        </div>
                    )}
                </div>

                {/* Modals */}
                {showAddModal && (
                    <AddRoleModal
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        onRoleAdded={handleRoleAdded}
                    />
                )}

                {showEditModal && selectedRole && (
                    <EditRoleModal
                        isOpen={showEditModal}
                        onClose={() => {
                            setShowEditModal(false);
                            setSelectedRole(null);
                        }}
                        onRoleUpdated={handleRoleUpdated}
                        role={selectedRole}
                    />
                )}

                {showDeleteConfirm && selectedRole && (
                    <ConfirmationPopup
                        isOpen={showDeleteConfirm}
                        message={`Bạn có chắc chắn muốn xóa role "${selectedRole.roleName}" (${selectedRole.roleId})? Hành động này không thể hoàn tác.`}
                        onConfirm={confirmDeleteRole}
                        onClose={() => {
                            console.log('Delete confirmation onClose called');
                            setShowDeleteConfirm(false);
                            setSelectedRole(null);
                        }}
                        isLoading={isDeleting}
                    />
                )}
            </div>
        </>
    );
};

export default RolePage;
