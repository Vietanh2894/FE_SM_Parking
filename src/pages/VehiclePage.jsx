import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditVehicleModal from '../components/modals/EditVehicleModal';
import AddVehicleModal from '../components/modals/AddVehicleModal';
import ConfirmationPopup from '../components/common/ConfirmationPopup';
import DashboardNavigation from '../components/DashboardNavigation';

const VehiclePage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [originalVehicles, setOriginalVehicles] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const vehiclesPerPage = 8;

    // Function to refetch vehicles data
    const refetchVehicles = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No access token found.');
            setLoading(false);
            return;
        }
        
        try {
            const response = await axios.get('http://localhost:8080/vehicles', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            let vehicleData = [];
            if (response.data && Array.isArray(response.data.data)) {
                vehicleData = response.data.data;
            }
            
            if (vehicleData.length > 0) {
                setVehicles(vehicleData);
                setOriginalVehicles(vehicleData);
                setError(null);
            } else {
                setError('No vehicles found.');
            }
        } catch (err) {
            setError('An error occurred while fetching vehicles.');
            console.error('Refetch vehicles error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchVehicles = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No access token found.');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get('http://localhost:8080/vehicles', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log('Full response:', response);
                console.log('Response data:', response.data);
                console.log('Response data.data:', response.data.data);
                console.log('Is array?', Array.isArray(response.data.data));
                
                // More flexible response handling
                let vehicleData = [];
                if (response.data) {
                    if (Array.isArray(response.data.data)) {
                        vehicleData = response.data.data;
                        console.log('Success: Found vehicle data in response.data.data');
                    } else if (Array.isArray(response.data)) {
                        vehicleData = response.data;
                        console.log('Success: Found vehicle data in response.data');
                    }
                }
                
                console.log('Final vehicleData:', vehicleData);
                console.log('vehicleData length:', vehicleData.length);
                
                if (vehicleData.length > 0) {
                    console.log('Setting vehicles to state...');
                    setVehicles(vehicleData);
                    setOriginalVehicles(vehicleData);
                    setError(null); // Clear any previous errors
                    setLoading(false);
                    console.log('State updated successfully');
                } else {
                    console.log('No vehicle data found or empty array');
                    setError('No vehicles found.');
                    setLoading(false);
                }
            } catch (err) {
                setError('An error occurred while fetching vehicles.');
                setLoading(false);
                console.error('Fetch vehicles error:', err);
            }
        };
        fetchVehicles();
    }, []);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };

    const handleDeleteClick = (vehicle) => {
        console.log('Delete click for vehicle:', vehicle);
        setVehicleToDelete(vehicle);
        setShowDeleteConfirm(true);
        console.log('Delete confirmation dialog should show now');
    };

    const handleDeleteVehicle = async () => {
        if (!vehicleToDelete) return;

        setIsDeleteSubmitting(true);
        const { bienSoXe } = vehicleToDelete;
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Không tìm thấy token xác thực.', 'error');
            setIsDeleteSubmitting(false);
            return;
        }

        try {
            console.log('Sending DELETE request for vehicle:', bienSoXe);
            const response = await axios.delete(`http://localhost:8080/vehicles/${bienSoXe}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('Delete API Response:', response);
            console.log('Delete Response status:', response.status);
            console.log('Delete Response data:', response.data);
            
            if (response.data && (response.data.statusCode === 200 || response.status === 200)) {
                console.log('Vehicle deleted successfully, refreshing data...');
                showNotification(`Xóa thành công xe có biển số: ${bienSoXe}`, 'success');
                setShowDeleteConfirm(false);
                setVehicleToDelete(null);
                setIsDeleteMode(false);
                await refetchVehicles();
                console.log('Delete process completed');
            } else {
                console.log('Vehicle deletion failed:', response.data);
                showNotification(response.data?.message || 'Không thể xóa xe.', 'error');
            }
        } catch (err) {
            console.error('Delete vehicle error:', err);
            console.error('Delete error details:', err.response?.data);
            showNotification(err.response?.data?.message || 'Lỗi khi xóa xe.', 'error');
        } finally {
            setIsDeleteSubmitting(false);
        }
    };

    // Placeholder for Create and Update functions
    const handleCreateVehicle = async (newVehicleData) => {
        console.log('Creating vehicle with data:', newVehicleData);
        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Authentication token not found.', 'error');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/vehicles', newVehicleData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Create vehicle response:', response);

            // Check if response is successful
            if (response.data && (response.data.statusCode === 200 || response.status === 200 || response.status === 201)) {
                // Close modal immediately
                setIsAddModalOpen(false);
                
                // Show success notification
                showNotification('Thêm xe mới thành công!', 'success');
                
                // Refetch data to ensure sync with backend
                await refetchVehicles();
                
                // Navigate to last page to show the new vehicle
                const updatedVehiclesCount = vehicles.length + 1;
                const newTotalPages = Math.ceil(updatedVehiclesCount / vehiclesPerPage);
                setCurrentPage(newTotalPages);
                
            } else {
                showNotification(response.data?.message || 'Không thể thêm xe.', 'error');
            }
        } catch (err) {
            console.error('Create vehicle error:', err);
            showNotification(err.response?.data?.message || 'Đã có lỗi xảy ra khi thêm xe.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleUpdateVehicle = async (updatedVehicle) => {
        setIsEditSubmitting(true);
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Authentication token not found.', 'error');
            setIsEditSubmitting(false);
            return;
        }

        try {
            const response = await axios.put('http://localhost:8080/vehicles', updatedVehicle, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && (response.data.statusCode === 200 || response.status === 200)) {
                // Close edit mode
                setEditingVehicle(null);
                setIsEditMode(false);
                
                // Show success notification
                showNotification('Cập nhật thông tin xe thành công!', 'success');
                
                // Refetch data to ensure sync with backend
                await refetchVehicles();
            } else {
                showNotification(response.data?.message || 'Không thể cập nhật xe.', 'error');
            }
        } catch (err) {
            console.error('Update vehicle error:', err);
            showNotification(err.response?.data?.message || 'Đã có lỗi xảy ra khi cập nhật xe.', 'error');
        } finally {
            setIsEditSubmitting(false);
        }
    };

    const handleSearch = async () => {
        setCurrentPage(1);
        if (!searchInput.trim()) {
            setVehicles(originalVehicles);
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
            const response = await axios.get(`http://localhost:8080/vehicles/${searchInput}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data && response.data.statusCode === 200) {
                setVehicles(response.data.data ? [response.data.data] : []);
                if (!response.data.data) {
                    setError(`Vehicle with license plate ${searchInput} not found.`);
                }
            } else {
                setVehicles([]);
                setError(response.data.message || `Vehicle with license plate ${searchInput} not found.`);
            }
        } catch (err) {
            setVehicles([]);
            setError(err.response?.data?.message || `Vehicle with license plate ${searchInput} not found or an error occurred.`);
            console.error('Search error:', err);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    // Pagination Logic
    const indexOfLastVehicle = currentPage * vehiclesPerPage;
    const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
    const currentVehicles = vehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
    const totalPages = Math.ceil(vehicles.length / vehiclesPerPage);

    // Đảm bảo currentPage không vượt quá totalPages
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        } else if (totalPages === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    // Debug logs for render
    console.log('RENDER - vehicles length:', vehicles.length);
    console.log('RENDER - error state:', error);
    console.log('RENDER - currentVehicles:', currentVehicles);

    return (
        <>
            <DashboardNavigation />
            <div className="ml-64 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="p-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex flex-col gap-4">
                                {/* Title */}
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                                        <span className="text-4xl">🚗</span>
                                        Quản lý phương tiện
                                    </h1>
                                    <p className="text-gray-600">Quản lý danh sách phương tiện trong hệ thống</p>
                                </div>
                                
                                {/* Controls Row */}
                                <div className="flex items-center gap-4 flex-wrap">
                                    {/* Search Input */}
                                    <div className="flex-1 min-w-80">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder=" Tìm kiếm theo biển số xe..."
                                                value={searchInput}
                                                onChange={(e) => setSearchInput(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <span className="text-gray-400 text-xl">🔍</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <button
                                        onClick={handleSearch}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 flex items-center gap-2"
                                    >
                                        <span>🔍</span>
                                        Tìm kiếm
                                    </button>
                                    <button
                                        onClick={() => { 
                                            setVehicles(originalVehicles); 
                                            setError(null); 
                                            setIsDeleteMode(false); 
                                            setIsEditMode(false); 
                                            setCurrentPage(1);
                                            setSearchInput('');
                                        }}
                                        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 flex items-center gap-2"
                                    >
                                        <span>🔄</span>
                                        Làm mới
                                    </button>
                                    {/* <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                                    >
                                        <span>➕</span>
                                        Thêm phương tiện
                                    </button> */}
                                    <button
                                        onClick={() => { setIsEditMode(!isEditMode); setIsDeleteMode(false); }}
                                        className={`font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg ${
                                            isEditMode 
                                                ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                                                : 'bg-amber-500 hover:bg-amber-600 text-white'
                                        }`}
                                    >
                                        <span>✏️</span>
                                        {isEditMode ? '❌ Exit Edit' : 'Sửa'}
                                    </button>
                                    <button
                                        onClick={() => { setIsDeleteMode(!isDeleteMode); setIsEditMode(false); }}
                                        className={`font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg ${
                                            isDeleteMode 
                                                ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                                                : 'bg-red-500 hover:bg-red-600 text-white'
                                        }`}
                                    >
                                        <span>🗑️</span>
                                        {isDeleteMode ? '❌ Exit Delete' : 'Xóa'}
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
                                <p className="text-lg text-gray-600 font-medium">Đang tải dữ liệu phương tiện...</p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && !loading && (
                        <div className="mb-6 p-4 rounded-lg shadow-md bg-red-100 text-red-800 border border-red-200">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">❌</span>
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Vehicles Grid */}
                    {!loading && vehicles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {currentVehicles.map((vehicle) => (
                                <div 
                                    key={vehicle.bienSoXe} 
                                    className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:scale-105 border border-gray-100 cursor-pointer ${
                                        isDeleteMode ? 'hover:border-red-300 hover:bg-red-50' : 
                                        isEditMode ? 'hover:border-amber-300 hover:bg-amber-50' : ''
                                    }`}
                                    onClick={() => {
                                        if (isDeleteMode) {
                                            handleDeleteClick(vehicle);
                                        } else if (isEditMode) {
                                            setEditingVehicle(vehicle);
                                        }
                                    }}
                                >
                                    {/* Vehicle Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl ${
                                            vehicle.maLoaiXe?.tenLoaiXe === 'Xe máy' ? 'bg-gradient-to-r from-orange-500 to-red-600' :
                                            vehicle.maLoaiXe?.tenLoaiXe === 'Xe ô tô' ? 'bg-gradient-to-r from-blue-500 to-purple-600' :
                                            vehicle.maLoaiXe?.tenLoaiXe === 'Xe đạp' ? 'bg-gradient-to-r from-green-500 to-teal-600' : 
                                            'bg-gradient-to-r from-gray-500 to-gray-600'
                                        }`}>
                                            {vehicle.maLoaiXe?.tenLoaiXe === 'Xe máy' ? '🏍️' :
                                             vehicle.maLoaiXe?.tenLoaiXe === 'Xe ô tô' ? '🚗' :
                                             vehicle.maLoaiXe?.tenLoaiXe === 'Xe đạp' ? '🚲' : '🚗'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={vehicle.tenXe}>
                                                {vehicle.tenXe}
                                            </h3>
                                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold inline-block">
                                                {vehicle.bienSoXe}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vehicle Details */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">🏷️</span>
                                            <div className="flex flex-col">
                                                <span className={`font-semibold text-sm px-2 py-1 rounded-full ${
                                                    vehicle.maLoaiXe?.tenLoaiXe === 'Xe máy' ? 'bg-orange-100 text-orange-800' :
                                                    vehicle.maLoaiXe?.tenLoaiXe === 'Xe ô tô' ? 'bg-blue-100 text-blue-800' :
                                                    vehicle.maLoaiXe?.tenLoaiXe === 'Xe đạp' ? 'bg-green-100 text-green-800' : 
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {vehicle.maLoaiXe?.tenLoaiXe || 'Chưa phân loại'}
                                                </span>
                                                {vehicle.maLoaiXe?.maLoaiXe && (
                                                    <span className="text-xs text-gray-500 mt-1">Mã: {vehicle.maLoaiXe.maLoaiXe}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">📄</span>
                                            <div className="flex flex-col">
                                                <span className="text-gray-700 font-medium">
                                                    {vehicle.soCavet || 'Chưa có số cavet'}
                                                </span>
                                                <span className="text-xs text-gray-500">Số cavet</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">📅</span>
                                            <div className="flex flex-col">
                                                <span className="text-gray-700">
                                                    {new Date(vehicle.createdDate).toLocaleDateString('vi-VN', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit'
                                                    })}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(vehicle.createdDate).toLocaleTimeString('vi-VN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">👤</span>
                                            <div className="flex flex-col">
                                                <span className="text-gray-700 font-semibold">{vehicle.owner?.name || 'Chưa có chủ'}</span>
                                                {vehicle.owner?.email && (
                                                    <span className="text-xs text-gray-500">{vehicle.owner.email}</span>
                                                )}
                                                {vehicle.owner?.id && (
                                                    <span className="text-xs text-gray-400">ID: {vehicle.owner.id}</span>
                                                )}
                                            </div>
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
                                <div className="text-6xl mb-4">🚗</div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có phương tiện nào</h3>
                                <p className="text-gray-600 mb-4">
                                    Bắt đầu bằng việc thêm phương tiện đầu tiên vào hệ thống
                                </p>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                                >
                                    ➕ Thêm phương tiện đầu tiên
                                </button>
                            </div>
                        )
                    )}

                    {/* Pagination */}
                    {!loading && vehicles.length > 0 && totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 bg-white rounded-lg shadow-md p-4">
                            <div className="text-sm text-gray-600">
                                Hiển thị {indexOfFirstVehicle + 1} - {Math.min(indexOfLastVehicle, vehicles.length)} trong tổng số {vehicles.length} phương tiện
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

                    {/* Notification */}
                    {notification.message && (
                        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border-2 animate-bounce ${
                            notification.type === 'success' 
                                ? 'bg-green-50 text-green-800 border-green-200' 
                                : 'bg-red-50 text-red-800 border-red-200'
                        }`}>
                            <span className="text-xl">
                                {notification.type === 'success' ? '✅' : '❌'}
                            </span>
                            <span className="font-semibold">{notification.message}</span>
                            <button 
                                onClick={() => setNotification({ message: '', type: '' })}
                                className="text-xl font-bold hover:opacity-70 transition-all"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>

            {/* Modals */}
            {editingVehicle && (
                <EditVehicleModal 
                    isOpen={!!editingVehicle}
                    vehicle={editingVehicle} 
                    onSave={handleUpdateVehicle} 
                    onClose={() => { setEditingVehicle(null); setIsEditMode(false); }}
                    isSubmitting={isEditSubmitting}
                />
            )}
            
            {/* {isAddModalOpen && (
                <AddVehicleModal 
                    isOpen={isAddModalOpen}
                    onSave={handleCreateVehicle} 
                    onClose={() => setIsAddModalOpen(false)}
                    isSubmitting={isSubmitting}
                />
            )} */}

            {showDeleteConfirm && (
                <ConfirmationPopup
                    isOpen={showDeleteConfirm}
                    onClose={() => {
                        console.log('Delete confirmation onClose called');
                        setShowDeleteConfirm(false);
                        setVehicleToDelete(null);
                    }}
                    onConfirm={handleDeleteVehicle}
                    message={`Bạn có chắc chắn muốn xóa xe "${vehicleToDelete?.tenXe || vehicleToDelete?.bienSoXe || 'này'}"?`}
                    isLoading={isDeleteSubmitting}
                />
            )}
            </div>
        </>
    );
};

export default VehiclePage;

