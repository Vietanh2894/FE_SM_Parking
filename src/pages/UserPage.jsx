import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditUserModal from '../components/modals/EditUserModal';
import AddUserModal from '../components/modals/AddUserModal';
import ConfirmationPopup from '../components/common/ConfirmationPopup';
import DashboardNavigation from '../components/DashboardNavigation';

const UserPage = () => {
    const [users, setUsers] = useState([]);
    const [originalUsers, setOriginalUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
    const usersPerPage = 6;

    // Function to refetch users data
    const refetchUsers = async () => {
        console.log('refetchUsers called...');
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No access token found.');
            setLoading(false);
            return;
        }
        
        try {
            console.log('Fetching users from API...');
            const response = await axios.get('http://localhost:8080/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('Refetch response:', response);
            
            let userData = [];
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                userData = response.data.data;
                                {/* ➕ Add User (ẩn theo yêu cầu) */}
            }
            
            if (userData.length >= 0) { // Changed from > 0 to >= 0 to allow empty arrays
                setUsers(userData);
                setOriginalUsers(userData);
                setError(null);
                console.log('Users updated successfully:', userData);
            } else {
                setUsers([]);
                setOriginalUsers([]);
                        {/* isOpen={isAddModalOpen} */}
                console.log('No users found in response');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.message || 'Error fetching users');
        } finally {
            setLoading(false);
            console.log('refetchUsers completed');
        }
    };

    useEffect(() => {
        refetchUsers();
    }, []);

    // Show notification
    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    // Add user handler
    const handleAddUser = async (userData) => {
        console.log('handleAddUser called with:', userData);
        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Không tìm thấy token xác thực.', 'error');
            setIsSubmitting(false);
            return;
        }

        try {
            console.log('Sending POST request to create user...');
            const response = await axios.post('http://localhost:8080/users', userData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('API Response:', response);
            console.log('Response status:', response.status);
            console.log('Response data:', response.data);

            if (response.data && (response.data.statusCode === 200 || response.status === 200 || response.status === 201)) {
                console.log('User created successfully, closing modal and refreshing data...');
                showNotification('Thêm người dùng thành công!', 'success');
                setIsAddModalOpen(false); // Close modal
                console.log('Modal should be closed now, isAddModalOpen set to false');
                await refetchUsers(); // Refresh data
                console.log('Data refreshed');
            } else {
                console.log('User creation failed:', response.data);
                showNotification(response.data?.message || 'Không thể thêm người dùng.', 'error');
            }
        } catch (err) {
            console.error('Add user error:', err);
            console.error('Error details:', err.response?.data);
            showNotification(err.response?.data?.message || 'Lỗi khi thêm người dùng.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update user handler
    const handleUpdateUser = async (updatedUser) => {
        console.log('handleUpdateUser called with:', updatedUser);
        setIsEditSubmitting(true);
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Không tìm thấy token xác thực.', 'error');
            setIsEditSubmitting(false);
            return;
        }

        try {
            console.log('Sending PUT request to update user...');
            const response = await axios.put('http://localhost:8080/users', updatedUser, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Update API Response:', response);
            console.log('Update Response status:', response.status);
            console.log('Update Response data:', response.data);

            if (response.data && (response.data.statusCode === 200 || response.status === 200)) {
                console.log('User updated successfully, closing modal and refreshing data...');
                setEditingUser(null);
                setIsEditMode(false);
                showNotification('Cập nhật người dùng thành công!', 'success');
                await refetchUsers();
                console.log('Update process completed');
            } else {
                console.log('User update failed:', response.data);
                showNotification(response.data?.message || 'Không thể cập nhật người dùng.', 'error');
            }
        } catch (err) {
            console.error('Update user error:', err);
            console.error('Update error details:', err.response?.data);
            showNotification(err.response?.data?.message || 'Lỗi khi cập nhật người dùng.', 'error');
        } finally {
            setIsEditSubmitting(false);
        }
    };

    // Delete user handlers
    const handleDeleteClick = (user) => {
        console.log('Delete click for user:', user);
        setUserToDelete(user);
        setShowDeleteConfirm(true);
        console.log('Delete confirmation dialog should show now');
    };

    const handleDeleteUser = async () => {
        console.log('handleDeleteUser called for user:', userToDelete);
        if (!userToDelete) return;

        setIsDeleteSubmitting(true);
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Không tìm thấy token xác thực.', 'error');
            setIsDeleteSubmitting(false);
            return;
        }

        try {
            console.log('Sending DELETE request for user ID:', userToDelete.id);
            const response = await axios.delete(`http://localhost:8080/users/${userToDelete.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('Delete API Response:', response);
            console.log('Delete Response status:', response.status);
            console.log('Delete Response data:', response.data);

            if (response.data && (response.data.statusCode === 200 || response.status === 200)) {
                console.log('User deleted successfully, refreshing data...');
                showNotification('Xóa người dùng thành công!', 'success');
                setShowDeleteConfirm(false);
                setUserToDelete(null);
                setIsDeleteMode(false);
                await refetchUsers();
                console.log('Delete process completed');
            } else {
                console.log('User deletion failed:', response.data);
                showNotification(response.data?.message || 'Không thể xóa người dùng.', 'error');
            }
        } catch (err) {
            console.error('Delete user error:', err);
            console.error('Delete error details:', err.response?.data);
            showNotification(err.response?.data?.message || 'Lỗi khi xóa người dùng.', 'error');
        } finally {
            setIsDeleteSubmitting(false);
        }
    };

    // Search functionality - Client-side filtering
    const handleSearch = async () => {
        setCurrentPage(1);
        if (!searchInput.trim()) {
            setUsers(originalUsers);
            setError(null);
            return;
        }

        // Filter users based on name or email
        const searchTerm = searchInput.toLowerCase();
        const filteredUsers = originalUsers.filter(user => 
            user.name?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm) ||
            user.id?.toString().includes(searchTerm)
        );

        if (filteredUsers.length > 0) {
            setUsers(filteredUsers);
            setError(null);
        } else {
            setUsers([]);
            setError(`No users found matching "${searchInput}".`);
        }
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setUsers(originalUsers);
        setError(null);
        setCurrentPage(1);
    };

    // Pagination
    const totalPages = Math.ceil(users.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    // Loading state
    if (loading) {
        return (
            <>
                <DashboardNavigation />
                <div className="ml-64 p-8">
                    <div className="flex justify-center items-center h-screen flex-col">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-500 mb-6"></div>
                        <p className="text-gray-600 text-xl font-medium">Loading users...</p>
                    </div>
                </div>
            </>
        );
    }

    // Error state
    if (error && users.length === 0) {
        return (
            <>
                <DashboardNavigation />
                <div className="ml-64 p-8">
                    <div className="flex justify-center items-center h-screen flex-col">
                        <div className="text-6xl mb-4">⚠️</div>
                        <p className="text-red-600 text-xl mb-6 text-center max-w-md">{error}</p>
                        <button 
                            onClick={refetchUsers}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                            🔄 Try Again
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <DashboardNavigation />
            <div className="ml-64 p-6 bg-gray-50 min-h-screen">
                {/* Header with Controls */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col gap-4">
                        {/* Title */}
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            👥 User Management
                        </h1>
                        
                        {/* Controls Row */}
                        <div className="flex items-center gap-4 flex-wrap">
                            {/* Search Input */}
                            <input
                                type="text"
                                placeholder="🔍 Search users by name or email..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="flex-1 min-w-80 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                            />
                            
                            {/* Action Buttons */}
                            <button 
                                onClick={handleSearch}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors duration-200 flex items-center gap-2"
                            >
                                🔍 Search
                            </button>
                            <button 
                                onClick={handleClearSearch}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors duration-200 flex items-center gap-2"
                            >
                                🔄 Clear
                            </button>
                            {/* <button
                                onClick={() => {
                                    console.log('Add User button clicked');
                                    setIsAddModalOpen(true);
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                            >
                                ➕ Add User
                            </button> */}
                            <button
                                onClick={() => {
                                    console.log('Edit Mode button clicked, current mode:', isEditMode);
                                    setIsEditMode(!isEditMode);
                                    if (isEditMode) {
                                        setEditingUser(null); // Clear editing user when exiting edit mode
                                    }
                                }}
                                className={`font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                                    isEditMode 
                                        ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                            >
                                {isEditMode ? '❌ Exit Edit' : '✏️ Edit Mode'}
                            </button>
                            <button
                                onClick={() => {
                                    console.log('Delete Mode button clicked, current mode:', isDeleteMode);
                                    setIsDeleteMode(!isDeleteMode);
                                    if (isDeleteMode) {
                                        setUserToDelete(null); // Clear user to delete when exiting delete mode
                                        setShowDeleteConfirm(false); // Close any open confirmation
                                    }
                                }}
                                className={`font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                                    isDeleteMode 
                                        ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                }`}
                            >
                                {isDeleteMode ? '❌ Exit Delete' : '🗑️ Delete Mode'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notification */}
                {notification.message && (
                    <div className={`mb-6 p-4 rounded-lg font-medium ${
                        notification.type === 'success' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                        {notification.type === 'success' ? '✅' : '❌'} {notification.message}
                    </div>
                )}

                {/* Users Grid */}
                {users.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {currentUsers.map((user) => (
                                <div 
                                    key={user.id}
                                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md ${
                                        isDeleteMode ? 'hover:border-red-300 hover:bg-red-50 cursor-pointer' : ''
                                    } ${
                                        isEditMode ? 'hover:border-blue-300 hover:bg-blue-50 cursor-pointer' : ''
                                    }`}
                                    onClick={() => {
                                        if (isDeleteMode) {
                                            console.log('User card clicked for delete, user:', user);
                                            handleDeleteClick(user);
                                        } else if (isEditMode) {
                                            console.log('User card clicked for edit, user:', user);
                                            console.log('Setting editing user...');
                                            setEditingUser(user);
                                        }
                                    }}
                                >
                                    {/* User Info */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-800 truncate">
                                                {user.name || 'N/A'}
                                            </h3>
                                            <p className="text-sm text-gray-500 truncate">
                                                ID: {user.id}
                                            </p>
                                        </div>
                                    </div>

                                    {/* User Details */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">📧</span>
                                            <span className="text-gray-700 truncate">{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">�</span>
                                            <span className="text-gray-700">ID: {user.id}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">�</span>
                                            <span className="text-gray-700 text-xs">Encrypted Password</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">🟢</span>
                                            <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                Active
                                            </span>
                                        </div>
                                    </div>

                                    {/* Mode Indicators */}
                                    {isDeleteMode && (
                                        <div className="mt-4 p-2 bg-red-100 rounded-lg text-center">
                                            <span className="text-red-700 text-sm font-medium">🗑️ Click to delete</span>
                                        </div>
                                    )}
                                    {isEditMode && (
                                        <div className="mt-4 p-2 bg-blue-100 rounded-lg text-center">
                                            <span className="text-blue-700 text-sm font-medium">✏️ Click to edit</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex justify-between items-center flex-wrap gap-4">
                                    <div className="text-gray-600">
                                        Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, users.length)} of {users.length} users
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            ⏮️
                                        </button>
                                        <button 
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            ⬅️ Prev
                                        </button>
                                        
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else {
                                                const start = Math.max(1, currentPage - 2);
                                                pageNum = start + i;
                                                if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                                                        currentPage === pageNum
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        
                                        <button 
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            Next ➡️
                                        </button>
                                        <button 
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            ⏭️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="text-6xl mb-6">👥</div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Users Found</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            {searchInput ? `No users match "${searchInput}"` : 'Start by adding your first user to get started'}
                        </p>
                        {!searchInput && (
                            <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
                            >
                                ➕ Add First User
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {console.log('Rendering modals - isAddModalOpen:', isAddModalOpen)}
            {console.log('Edit modal state - isEditMode:', isEditMode, 'editingUser:', editingUser)}
            {console.log('Delete modal state - showDeleteConfirm:', showDeleteConfirm, 'userToDelete:', userToDelete)}
            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    console.log('Modal onClose called');
                    setIsAddModalOpen(false);
                }}
                onSave={handleAddUser}
                isSubmitting={isSubmitting}
            />

            <EditUserModal
                isOpen={isEditMode && editingUser !== null}
                onClose={() => {
                    console.log('Edit modal onClose called');
                    setIsEditMode(false);
                    setEditingUser(null);
                }}
                onSave={handleUpdateUser}
                user={editingUser}
                isSubmitting={isEditSubmitting}
            />

            <ConfirmationPopup
                isOpen={showDeleteConfirm}
                onClose={() => {
                    console.log('Delete confirmation onClose called');
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                }}
                onConfirm={handleDeleteUser}
                message={`Bạn có chắc chắn muốn xóa người dùng "${userToDelete?.name || userToDelete?.email || 'này'}"?`}
                isLoading={isDeleteSubmitting}
            />
        </>
    );
};

export default UserPage;
