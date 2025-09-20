import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditVehicleTypeModal from '../components/modals/EditVehicleTypeModal';
import AddVehicleTypeModal from '../components/modals/AddVehicleTypeModal';
import ConfirmationPopup from '../components/common/ConfirmationPopup';
import DashboardNavigation from '../components/DashboardNavigation';

const VehicleTypePage = () => {
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [originalVehicleTypes, setOriginalVehicleTypes] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingVehicleType, setEditingVehicleType] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [vehicleTypeToDelete, setVehicleTypeToDelete] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const vehicleTypesPerPage = 8;

    // Function to refetch vehicle types data
    const refetchVehicleTypes = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No access token found.');
            setLoading(false);
            return;
        }
        
        try {
            const response = await axios.get('http://localhost:8080/vehicle-types', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            let vehicleTypeData = [];
            if (response.data && Array.isArray(response.data.data)) {
                vehicleTypeData = response.data.data;
            }
            
            if (vehicleTypeData.length > 0) {
                setVehicleTypes(vehicleTypeData);
                setOriginalVehicleTypes(vehicleTypeData);
                setError(null);
            } else {
                setError('No vehicle types found.');
            }
        } catch (err) {
            setError('An error occurred while fetching vehicle types.');
            console.error('Refetch vehicle types error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchVehicleTypes = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No access token found.');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get('http://localhost:8080/vehicle-types', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log('Full response:', response);
                console.log('Response data:', response.data);
                console.log('Response data.data:', response.data.data);
                console.log('Is array?', Array.isArray(response.data.data));
                
                // More flexible response handling
                let vehicleTypeData = [];
                if (response.data) {
                    if (Array.isArray(response.data.data)) {
                        vehicleTypeData = response.data.data;
                        console.log('Success: Found vehicle type data in response.data.data');
                    } else if (Array.isArray(response.data)) {
                        vehicleTypeData = response.data;
                        console.log('Success: Found vehicle type data in response.data');
                    }
                }
                
                console.log('Final vehicleTypeData:', vehicleTypeData);
                console.log('vehicleTypeData length:', vehicleTypeData.length);
                
                if (vehicleTypeData.length > 0) {
                    console.log('Setting vehicle types to state...');
                    setVehicleTypes(vehicleTypeData);
                    setOriginalVehicleTypes(vehicleTypeData);
                    setError(null); // Clear any previous errors
                    setLoading(false);
                    console.log('State updated successfully');
                } else {
                    console.log('No vehicle type data found or empty array');
                    setVehicleTypes([]);
                    setOriginalVehicleTypes([]);
                    setError('No vehicle types found.');
                    setLoading(false);
                }
            } catch (err) {
                console.error('Initial fetch error:', err);
                console.error('Error response:', err.response);
                setError('An error occurred while fetching vehicle types.');
                setVehicleTypes([]);
                setOriginalVehicleTypes([]);
                setLoading(false);
            }
        };

        fetchVehicleTypes();
    }, []);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };

    const handleDeleteClick = (vehicleType) => {
        console.log('Delete click for vehicle type:', vehicleType);
        setVehicleTypeToDelete(vehicleType);
        setShowDeleteConfirm(true);
        console.log('Delete confirmation dialog should show now');
    };

    const handleConfirmDelete = async () => {
        if (!vehicleTypeToDelete) return;

        setIsDeleteSubmitting(true);
        const { maLoaiXe } = vehicleTypeToDelete;
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Authentication token not found.', 'error');
            setIsDeleteSubmitting(false);
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/vehicle-types/${maLoaiXe}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Show success notification
            showNotification(`Xóa thành công loại xe: ${vehicleTypeToDelete.tenLoaiXe}`, 'success');
            
            // Close delete mode and confirmation
            setIsDeleteMode(false);
            setShowDeleteConfirm(false);
            setVehicleTypeToDelete(null);
            
            // Refetch data to ensure sync with backend
            await refetchVehicleTypes();

        } catch (err) {
            console.error('Delete vehicle type error:', err);
            showNotification(err.response?.data?.message || 'Đã có lỗi xảy ra khi xóa loại xe.', 'error');
        } finally {
            setIsDeleteSubmitting(false);
        }
    };

    // Placeholder for Create and Update functions
    const handleCreateVehicleType = async (newVehicleTypeData) => {
        console.log('Creating vehicle type with data:', newVehicleTypeData);
        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Authentication token not found.', 'error');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/vehicle-types', newVehicleTypeData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Create vehicle type response:', response);

            // Check if response is successful
            if (response.data && (response.data.statusCode === 200 || response.status === 200 || response.status === 201)) {
                // Close modal immediately
                setIsAddModalOpen(false);
                
                // Show success notification
                showNotification('Thêm loại xe mới thành công!', 'success');
                
                // Refetch data to ensure sync with backend
                await refetchVehicleTypes();
                
                // Navigate to last page to show the new vehicle type
                const updatedVehicleTypesCount = vehicleTypes.length + 1;
                const newTotalPages = Math.ceil(updatedVehicleTypesCount / vehicleTypesPerPage);
                setCurrentPage(newTotalPages);
                
            } else {
                showNotification(response.data?.message || 'Không thể thêm loại xe.', 'error');
            }
        } catch (err) {
            console.error('Create vehicle type error:', err);
            showNotification(err.response?.data?.message || 'Đã có lỗi xảy ra khi thêm loại xe.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateVehicleType = async (updatedVehicleType) => {
        setIsEditSubmitting(true);
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Authentication token not found.', 'error');
            setIsEditSubmitting(false);
            return;
        }

        try {
            const response = await axios.put('http://localhost:8080/vehicle-types', updatedVehicleType, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && (response.data.statusCode === 200 || response.status === 200)) {
                // Close edit mode
                setEditingVehicleType(null);
                setIsEditMode(false);
                
                // Show success notification
                showNotification('Cập nhật thông tin loại xe thành công!', 'success');
                
                // Refetch data to ensure sync with backend
                await refetchVehicleTypes();
            } else {
                showNotification(response.data?.message || 'Không thể cập nhật loại xe.', 'error');
            }
        } catch (err) {
            console.error('Update vehicle type error:', err);
            showNotification(err.response?.data?.message || 'Đã có lỗi xảy ra khi cập nhật loại xe.', 'error');
        } finally {
            setIsEditSubmitting(false);
        }
    };

    const handleSearch = async () => {
        setCurrentPage(1);
        if (!searchInput.trim()) {
            setVehicleTypes(originalVehicleTypes);
            setError(null);
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authentication token not found.');
            return;
        }
        setError(null);
        try {
            const response = await axios.get(`http://localhost:8080/vehicle-types/${searchInput}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data && response.data.statusCode === 200) {
                setVehicleTypes(response.data.data ? [response.data.data] : []);
                if (!response.data.data) {
                    setError(`Vehicle type with code ${searchInput} not found.`);
                }
            } else {
                setVehicleTypes([]);
                setError(response.data.message || `Vehicle type with code ${searchInput} not found.`);
            }
        } catch (err) {
            setVehicleTypes([]);
            setError(err.response?.data?.message || `Vehicle type with code ${searchInput} not found or an error occurred.`);
            console.error('Search error:', err);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    // Pagination Logic
    const indexOfLastVehicleType = currentPage * vehicleTypesPerPage;
    const indexOfFirstVehicleType = indexOfLastVehicleType - vehicleTypesPerPage;
    const currentVehicleTypes = vehicleTypes.slice(indexOfFirstVehicleType, indexOfLastVehicleType);
    const totalPages = Math.ceil(vehicleTypes.length / vehicleTypesPerPage);

    // Đảm bảo currentPage không vượt quá totalPages
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        } else if (totalPages === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    // Debug logs for render
    console.log('RENDER - vehicle types length:', vehicleTypes.length);
    console.log('RENDER - error state:', error);
    console.log('RENDER - currentVehicleTypes:', currentVehicleTypes);

    return (
        <>
            <DashboardNavigation />
            <div className="ml-64 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="p-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý loại xe</h1>
                                        <p className="text-gray-600">Quản lý các loại phương tiện trong hệ thống</p>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => {
                                                setSearchInput('');
                                                setVehicleTypes(originalVehicleTypes);
                                                setError(null);
                                            }}
                                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                                        >
                                            🔄 Làm mới
                                        </button>
                                        <button
                                            onClick={() => setIsAddModalOpen(true)}
                                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                                        >
                                            ➕ Thêm loại xe
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditMode(!isEditMode);
                                                setIsDeleteMode(false);
                                            }}
                                            className={`${isEditMode ? 'bg-amber-600' : 'bg-amber-500'} hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2`}
                                        >
                                            ✏️ Sửa
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsDeleteMode(!isDeleteMode);
                                                setIsEditMode(false);
                                            }}
                                            className={`${isDeleteMode ? 'bg-red-600' : 'bg-red-500'} hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2`}
                                        >
                                            🗑️ Xóa
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Search Section */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm theo mã loại xe..."
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                        />
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                                            🔍
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                                    >
                                        🔍 Tìm kiếm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                                <p className="text-lg text-gray-600 font-medium">Đang tải dữ liệu loại xe...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-lg">
                            <div className="flex items-center">
                                <span className="text-2xl mr-3">⚠️</span>
                                <p className="text-red-700 font-medium">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Notification */}
                    {notification.message && (
                        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
                            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                            <div className="flex items-center gap-2">
                                <span className="text-xl">
                                    {notification.type === 'success' ? '✅' : '❌'}
                                </span>
                                <p className="font-medium">{notification.message}</p>
                            </div>
                        </div>
                    )}

                    {/* Vehicle Types Grid */}
                    {!loading && vehicleTypes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {currentVehicleTypes.map((vehicleType) => (
                                <div 
                                    key={vehicleType.maLoaiXe} 
                                    className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:scale-105 border border-gray-100 cursor-pointer ${
                                        isDeleteMode ? 'hover:border-red-300 hover:bg-red-50' : 
                                        isEditMode ? 'hover:border-amber-300 hover:bg-amber-50' : ''
                                    }`}
                                    onClick={() => {
                                        if (isDeleteMode) {
                                            handleDeleteClick(vehicleType);
                                        } else if (isEditMode) {
                                            setEditingVehicleType(vehicleType);
                                        }
                                    }}
                                >
                                    {/* Vehicle Type Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl ${
                                            vehicleType.tenLoaiXe === 'Xe máy' ? 'bg-gradient-to-r from-orange-500 to-red-600' :
                                            vehicleType.tenLoaiXe === 'Xe ô tô' ? 'bg-gradient-to-r from-blue-500 to-purple-600' :
                                            vehicleType.tenLoaiXe === 'Xe đạp' ? 'bg-gradient-to-r from-green-500 to-teal-600' : 
                                            'bg-gradient-to-r from-gray-500 to-gray-600'
                                        }`}>
                                            {vehicleType.tenLoaiXe === 'Xe máy' ? '🏍️' :
                                             vehicleType.tenLoaiXe === 'Xe ô tô' ? '🚗' :
                                             vehicleType.tenLoaiXe === 'Xe đạp' ? '🚲' : '🏷️'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={vehicleType.tenLoaiXe}>
                                                {vehicleType.tenLoaiXe}
                                            </h3>
                                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold inline-block">
                                                {vehicleType.maLoaiXe}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vehicle Type Details */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">🆔</span>
                                            <span className="text-gray-700 font-semibold">Mã: {vehicleType.maLoaiXe}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">📝</span>
                                            <span className="text-gray-700">
                                                {vehicleType.moTa || 'Không có mô tả'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">✅</span>
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                                Hoạt động
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Indicators */}
                                    {isDeleteMode && (
                                        <div className="text-center p-2 bg-red-50 border border-red-200 rounded-lg">
                                            <span className="text-red-600 font-semibold text-sm">🗑️ Click để xóa</span>
                                        </div>
                                    )}
                                    {isEditMode && (
                                        <div className="text-center p-2 bg-amber-50 border border-amber-200 rounded-lg">
                                            <span className="text-amber-600 font-semibold text-sm">✏️ Click để sửa</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        !loading && !error && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🏷️</div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có loại xe nào</h3>
                                <p className="text-gray-600 mb-4">
                                    Bắt đầu bằng việc thêm loại xe đầu tiên vào hệ thống
                                </p>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                                >
                                    ➕ Thêm loại xe đầu tiên
                                </button>
                            </div>
                        )
                    )}

                    {/* Pagination */}
                    {!loading && vehicleTypes.length > 0 && totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 bg-white rounded-lg shadow-md p-4">
                            <div className="text-sm text-gray-600">
                                Hiển thị {indexOfFirstVehicleType + 1} - {Math.min(indexOfLastVehicleType, vehicleTypes.length)} trong tổng số {vehicleTypes.length} loại xe
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ⏮️ Đầu
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← Trước
                                </button>
                                
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                currentPage === pageNum 
                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                                                    : 'text-blue-600 bg-white border border-blue-300 hover:bg-blue-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Tiếp →
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cuối ⏭️
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {editingVehicleType && (
                <EditVehicleTypeModal 
                    isOpen={!!editingVehicleType}
                    vehicleType={editingVehicleType} 
                    onSave={handleUpdateVehicleType} 
                    onClose={() => { setEditingVehicleType(null); setIsEditMode(false); }}
                    isSubmitting={isEditSubmitting}
                />
            )}
            
            {isAddModalOpen && (
                <AddVehicleTypeModal 
                    isOpen={isAddModalOpen}
                    onSave={handleCreateVehicleType} 
                    onClose={() => setIsAddModalOpen(false)}
                    isSubmitting={isSubmitting}
                />
            )}

            {showDeleteConfirm && (
                <ConfirmationPopup
                    isOpen={showDeleteConfirm}
                    onClose={() => {
                        console.log('Delete confirmation onClose called');
                        setShowDeleteConfirm(false);
                        setVehicleTypeToDelete(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    message={`Bạn có chắc chắn muốn xóa loại xe "${vehicleTypeToDelete?.tenLoaiXe || vehicleTypeToDelete?.maLoaiXe || 'này'}"?`}
                    isLoading={isDeleteSubmitting}
                />
            )}
        </>
    );
};

export default VehicleTypePage;
