import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddParkingLotModal from '../components/modals/AddParkingLotModal';
import EditParkingLotModal from '../components/modals/EditParkingLotModal';
import ConfirmationPopup from '../components/common/ConfirmationPopup';
import DashboardNavigation from '../components/DashboardNavigation';

const ParkingLotPage = () => {
    const [parkingLots, setParkingLots] = useState([]);
    const [filteredParkingLots, setFilteredParkingLots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedParkingLot, setSelectedParkingLot] = useState(null);
    
    // Loading states for operations
    const [savingData, setSavingData] = useState(false);

    useEffect(() => {
        fetchParkingLots();
    }, []);

    useEffect(() => {
        handleStatusFilter();
    }, [parkingLots, statusFilter]);

    // Show notification
    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    const fetchParkingLots = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/parking-lots', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.data && response.data.data) {
                setParkingLots(response.data.data);
                setFilteredParkingLots(response.data.data);
                setError('');
            } else {
                setParkingLots([]);
                setFilteredParkingLots([]);
            }
        } catch (error) {
            console.error('Error fetching parking lots:', error);
            setError('Không thể tải danh sách bãi đỗ');
            showNotification('Không thể tải danh sách bãi đỗ', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddParkingLot = async (parkingLotData) => {
        if (savingData) return;
        
        try {
            setSavingData(true);
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8080/parking-lots', parkingLotData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.status >= 200 && response.status < 300) {
                await fetchParkingLots();
                setShowAddModal(false);
                setError('');
                showNotification('Thêm bãi đỗ thành công!', 'success');
            } else {
                setError('Không thể thêm bãi đỗ. Vui lòng thử lại.');
                showNotification('Không thể thêm bãi đỗ', 'error');
            }
        } catch (error) {
            console.error('Error adding parking lot:', error);
            setError('Không thể thêm bãi đỗ. Vui lòng thử lại.');
            showNotification('Có lỗi xảy ra khi thêm bãi đỗ', 'error');
        } finally {
            setSavingData(false);
        }
    };

    const handleEditParkingLot = async (parkingLotData) => {
        if (savingData) return;
        
        try {
            setSavingData(true);
            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:8080/parking-lots', parkingLotData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.status >= 200 && response.status < 300) {
                await fetchParkingLots();
                setShowEditModal(false);
                setSelectedParkingLot(null);
                setError('');
                showNotification('Cập nhật bãi đỗ thành công!', 'success');
            } else {
                setError('Không thể cập nhật bãi đỗ. Vui lòng thử lại.');
                showNotification('Không thể cập nhật bãi đỗ', 'error');
            }
        } catch (error) {
            console.error('Error updating parking lot:', error);
            setError('Không thể cập nhật bãi đỗ. Vui lòng thử lại.');
            showNotification('Có lỗi xảy ra khi cập nhật bãi đỗ', 'error');
        } finally {
            setSavingData(false);
        }
    };

    const handleDeleteParkingLot = async () => {
        if (savingData || !selectedParkingLot) return;
        
        try {
            setSavingData(true);
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/parking-lots/${selectedParkingLot.maBaiDo}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            await fetchParkingLots();
            setShowDeleteModal(false);
            setSelectedParkingLot(null);
            setError('');
            showNotification('Xóa bãi đỗ thành công!', 'success');
        } catch (error) {
            console.error('Error deleting parking lot:', error);
            setError('Không thể xóa bãi đỗ. Vui lòng thử lại.');
            showNotification('Có lỗi xảy ra khi xóa bãi đỗ', 'error');
        } finally {
            setSavingData(false);
        }
    };

    // Vehicle operations
    const handleParkVehicle = async (maBaiDo) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/parking-lots/${maBaiDo}/park`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await fetchParkingLots();
            showNotification('Đỗ xe thành công!', 'success');
        } catch (error) {
            console.error('Error parking vehicle:', error);
            showNotification('Không thể đỗ xe', 'error');
        }
    };

    const handleUnparkVehicle = async (maBaiDo) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/parking-lots/${maBaiDo}/unpark`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await fetchParkingLots();
            showNotification('Rút xe thành công!', 'success');
        } catch (error) {
            console.error('Error unparking vehicle:', error);
            showNotification('Không thể rút xe', 'error');
        }
    };

    // Search and filter functions
    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setFilteredParkingLots(parkingLots);
            return;
        }

        const filtered = parkingLots.filter(lot =>
            lot.tenBaiDo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lot.maBaiDo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lot.diaChi?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredParkingLots(filtered);
        setCurrentPage(1);
    };

    const handleStatusFilter = () => {
        let filtered = parkingLots;
        
        if (statusFilter) {
            filtered = parkingLots.filter(lot => lot.trangThai === statusFilter);
        }
        
        setFilteredParkingLots(filtered);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setFilteredParkingLots(parkingLots);
        setCurrentPage(1);
    };

    // Utility functions
    const getOccupancyRate = (parkingLot) => {
        if (!parkingLot.tongSoCho) return 0;
        return Math.round(((parkingLot.tongSoCho - parkingLot.soChoTrong) / parkingLot.tongSoCho) * 100);
    };

    const getOccupancyColor = (rate) => {
        if (rate >= 90) return 'text-red-600 bg-red-100';
        if (rate >= 70) return 'text-orange-600 bg-orange-100';
        if (rate >= 50) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'text-green-600 bg-green-100';
            case 'INACTIVE': return 'text-red-600 bg-red-100';
            case 'MAINTENANCE': return 'text-orange-600 bg-orange-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'ACTIVE': return 'Hoạt động';
            case 'INACTIVE': return 'Ngưng hoạt động';
            case 'MAINTENANCE': return 'Bảo trì';
            default: return 'Không xác định';
        }
    };

    // Modal handlers
    const openEditModal = (parkingLot) => {
        setSelectedParkingLot(parkingLot);
        setShowEditModal(true);
    };

    const openDeleteModal = (parkingLot) => {
        setSelectedParkingLot(parkingLot);
        setShowDeleteModal(true);
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredParkingLots.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredParkingLots.length / itemsPerPage);

    // Loading state
    if (loading) {
        return (
            <>
                <DashboardNavigation />
                <div className="ml-64 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="flex items-center justify-center h-screen">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                            <p className="text-lg text-gray-600 font-medium">Đang tải dữ liệu bãi đỗ...</p>
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
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                                <span className="text-4xl">🅿️</span>
                                Quản lý bãi đỗ xe
                            </h1>
                            <p className="text-gray-600">Quản lý thông tin và trạng thái các bãi đỗ xe trong hệ thống</p>
                        </div>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-center">
                            <div className="flex-1 w-full lg:w-auto">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder=" Tìm kiếm theo tên, mã bãi đỗ hoặc địa chỉ..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-xl">🔍</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <button
                                    onClick={handleSearch}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                                >
                                    Tìm kiếm
                                </button>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="ACTIVE">Hoạt động</option>
                                    <option value="INACTIVE">Ngưng hoạt động</option>
                                    <option value="MAINTENANCE">Bảo trì</option>
                                </select>
                                <button
                                    onClick={clearFilters}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                                >
                                    <span>🔄</span>
                                    Làm mới
                                </button>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                                >
                                    <span className="text-lg">➕</span>
                                    Thêm mới
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notification */}
                    {notification.message && (
                        <div className={`mb-6 p-4 rounded-lg shadow-md ${
                            notification.type === 'success' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">
                                    {notification.type === 'success' ? '✅' : '❌'}
                                </span>
                                {notification.message}
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Có lỗi xảy ra</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={fetchParkingLots}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}

                    {/* Parking Lots Grid */}
                    {!error && (
                        <>
                            {currentItems.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {currentItems.map((parkingLot) => {
                                        const occupancyRate = getOccupancyRate(parkingLot);
                                        return (
                                            <div 
                                                key={parkingLot.maBaiDo}
                                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:scale-105 border border-gray-100"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                                                            🅿️
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-800 mb-1">
                                                                {parkingLot.tenBaiDo}
                                                            </h3>
                                                            <p className="text-sm text-gray-500">
                                                                {parkingLot.maBaiDo}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(parkingLot.trangThai)}`}>
                                                        {getStatusDisplay(parkingLot.trangThai)}
                                                    </span>
                                                </div>

                                                <div className="space-y-3 mb-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600 font-medium">Loại xe:</span>
                                                        <span className="font-semibold text-gray-800">
                                                            {parkingLot.maLoaiXe?.tenLoaiXe || 'N/A'}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600 font-medium">Sức chứa:</span>
                                                        <span className="font-bold text-lg">
                                                            <span className="text-green-600">{parkingLot.soChoTrong}</span>
                                                            <span className="text-gray-400 mx-1">/</span>
                                                            <span className="text-blue-600">{parkingLot.tongSoCho}</span>
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600 font-medium">Độ đầy:</span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getOccupancyColor(occupancyRate)}`}>
                                                            {occupancyRate}%
                                                        </span>
                                                    </div>

                                                    {parkingLot.diaChi && (
                                                        <div className="pt-2 border-t border-gray-100">
                                                            <span className="text-gray-600 font-medium">📍 </span>
                                                            <span className="text-sm text-gray-700">{parkingLot.diaChi}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2 pt-4 border-t border-gray-100">
                                                    <button
                                                        onClick={() => handleParkVehicle(parkingLot.maBaiDo)}
                                                        disabled={!parkingLot.soChoTrong || parkingLot.trangThai !== 'ACTIVE'}
                                                        className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1"
                                                        title="Đỗ xe"
                                                    >
                                                        🚗 Đỗ xe
                                                    </button>
                                                    <button
                                                        onClick={() => handleUnparkVehicle(parkingLot.maBaiDo)}
                                                        disabled={parkingLot.soChoTrong >= parkingLot.tongSoCho}
                                                        className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1"
                                                        title="Rút xe"
                                                    >
                                                        🚙 Rút xe
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(parkingLot)}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm"
                                                        title="Chỉnh sửa"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(parkingLot)}
                                                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm"
                                                        title="Xóa"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">🅿️</div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy bãi đỗ</h3>
                                    <p className="text-gray-600 mb-4">
                                        {searchTerm || statusFilter ? 
                                            'Không có bãi đỗ nào phù hợp với tiêu chí tìm kiếm' : 
                                            'Chưa có bãi đỗ nào trong hệ thống'
                                        }
                                    </p>
                                    {!searchTerm && !statusFilter && (
                                        <button
                                            onClick={() => setShowAddModal(true)}
                                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                                        >
                                            ➕ Thêm bãi đỗ đầu tiên
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 bg-white rounded-lg shadow-md p-4">
                                    <div className="text-sm text-gray-600">
                                        Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredParkingLots.length)} / {filteredParkingLots.length} bãi đỗ
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                                                currentPage === 1
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                            }`}
                                        >
                                            ⬅️ Trước
                                        </button>
                                        
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                                                    currentPage === i + 1
                                                        ? 'bg-blue-500 text-white shadow-md'
                                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        
                                        <button
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                                                currentPage === totalPages
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                            }`}
                                        >
                                            Sau ➡️
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddParkingLotModal
                    isOpen={showAddModal}
                    onSave={handleAddParkingLot}
                    onClose={() => setShowAddModal(false)}
                    isSubmitting={savingData}
                />
            )}

            {showEditModal && selectedParkingLot && (
                <EditParkingLotModal
                    isOpen={showEditModal}
                    parkingLot={selectedParkingLot}
                    onSave={handleEditParkingLot}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedParkingLot(null);
                    }}
                    isSubmitting={savingData}
                />
            )}

            {showDeleteModal && selectedParkingLot && (
                <ConfirmationPopup
                    isOpen={showDeleteModal}
                    message={`Bạn có chắc chắn muốn xóa bãi đỗ "${selectedParkingLot.tenBaiDo}" không?`}
                    onConfirm={handleDeleteParkingLot}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedParkingLot(null);
                    }}
                    isLoading={savingData}
                />
            )}
        </>
    );
};

export default ParkingLotPage;
