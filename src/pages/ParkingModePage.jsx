import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditParkingModeModal from '../components/modals/EditParkingModeModal';
import AddParkingModeModal from '../components/modals/AddParkingModeModal';
import ConfirmationPopup from '../components/common/ConfirmationPopup';
import DashboardNavigation from '../components/DashboardNavigation';

const ParkingModePage = () => {
    const [parkingModes, setParkingModes] = useState([]);
    const [originalParkingModes, setOriginalParkingModes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [selectedParkingMode, setSelectedParkingMode] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    // Fetch all parking modes
    const fetchParkingModes = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No access token found.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get('http://localhost:8080/parking-modes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('API Response:', response.data);
            
            if (response.data && response.data.data) {
                setParkingModes(response.data.data);
                setOriginalParkingModes(response.data.data);
                setError(null);
            } else {
                console.error('Unexpected response structure:', response.data);
                setParkingModes([]);
                setOriginalParkingModes([]);
            }
        } catch (error) {
            console.error('Error fetching parking modes:', error);
            setError('An error occurred while fetching parking modes.');
            setParkingModes([]);
            setOriginalParkingModes([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load data when component mounts
    useEffect(() => {
        fetchParkingModes();
    }, []);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };

    // Handle Add Parking Mode
    const handleAddParkingMode = async (parkingModeData) => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Authentication token not found.', 'error');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/parking-modes', parkingModeData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Add Response:', response.data);
            
            if (response.data && response.data.statusCode === 201) {
                showNotification('Thêm hình thức đỗ xe thành công!', 'success');
                setIsAddModalOpen(false);
                await fetchParkingModes();
            }
        } catch (error) {
            console.error('Error adding parking mode:', error);
            if (error.response?.data?.message) {
                showNotification(`Lỗi: ${error.response.data.message}`, 'error');
            } else {
                showNotification('Có lỗi xảy ra khi thêm hình thức đỗ xe!', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Update Parking Mode
    const handleUpdateParkingMode = async (parkingModeData) => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Authentication token not found.', 'error');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.put('http://localhost:8080/parking-modes', parkingModeData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Update Response:', response.data);
            
            if (response.data && response.data.statusCode === 200) {
                showNotification('Cập nhật hình thức đỗ xe thành công!', 'success');
                setIsEditModalOpen(false);
                setSelectedParkingMode(null);
                setIsEditMode(false);
                await fetchParkingModes();
            }
        } catch (error) {
            console.error('Error updating parking mode:', error);
            if (error.response?.data?.message) {
                showNotification(`Lỗi: ${error.response.data.message}`, 'error');
            } else {
                showNotification('Có lỗi xảy ra khi cập nhật hình thức đỗ xe!', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Delete Parking Mode
    const handleDeleteParkingMode = async () => {
        if (!selectedParkingMode) return;
        
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Authentication token not found.', 'error');
            setIsLoading(false);
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/parking-modes/${selectedParkingMode.maHinhThuc}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification('Xóa hình thức đỗ xe thành công!', 'success');
            setIsDeletePopupOpen(false);
            setSelectedParkingMode(null);
            setIsDeleteMode(false);
            await fetchParkingModes();
        } catch (error) {
            console.error('Error deleting parking mode:', error);
            if (error.response?.data?.message) {
                showNotification(`Lỗi: ${error.response.data.message}`, 'error');
            } else {
                showNotification('Có lỗi xảy ra khi xóa hình thức đỗ xe!', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = parkingModes.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(parkingModes.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Modal handlers
    const openEditModal = (parkingMode) => {
        setSelectedParkingMode(parkingMode);
        setIsEditModalOpen(true);
    };

    const openDeletePopup = (parkingMode) => {
        setSelectedParkingMode(parkingMode);
        setIsDeletePopupOpen(true);
    };

    const closeModals = () => {
        setIsEditModalOpen(false);
        setIsAddModalOpen(false);
        setIsDeletePopupOpen(false);
        setSelectedParkingMode(null);
    };

    const handleRowClick = (parkingMode) => {
        if (isDeleteMode) {
            openDeletePopup(parkingMode);
        } else if (isEditMode) {
            openEditModal(parkingMode);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        if (!searchTerm.trim()) {
            setParkingModes(originalParkingModes);
            setError(null);
            return;
        }
        
        const filtered = originalParkingModes.filter(parkingMode =>
            parkingMode.maHinhThuc.toLowerCase().includes(searchTerm.toLowerCase()) ||
            parkingMode.tenHinhThuc.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setParkingModes(filtered);
        
        if (filtered.length === 0) {
            setError(`Không tìm thấy hình thức đỗ xe nào với từ khóa "${searchTerm}"`);
        } else {
            setError(null);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <>
            <DashboardNavigation />
            <div className="ml-64 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="p-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                                <span className="text-4xl">🚗</span>
                                Quản lý hình thức đỗ xe
                            </h1>
                            <p className="text-gray-600">Quản lý các hình thức và phương thức đỗ xe trong hệ thống</p>
                        </div>
                    </div>

                    {/* Search and Action Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-center">
                            <div className="flex-1 w-full lg:w-auto">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="🔍 Tìm kiếm theo mã hình thức hoặc tên hình thức..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={handleKeyPress}
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
                                <button
                                    onClick={() => { 
                                        setParkingModes(originalParkingModes); 
                                        setError(null); 
                                        setIsDeleteMode(false); 
                                        setIsEditMode(false); 
                                        setCurrentPage(1);
                                        setSearchTerm('');
                                    }}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                                >
                                    <span>🔄</span>
                                    Làm mới
                                </button>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                                >
                                    <span className="text-lg">➕</span>
                                    Thêm mới
                                </button>
                                <button 
                                    onClick={() => { 
                                        setIsEditMode(!isEditMode); 
                                        setIsDeleteMode(false); 
                                    }} 
                                    className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2 ${
                                        isEditMode 
                                            ? 'bg-gray-500 text-white hover:bg-gray-600' 
                                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
                                    }`}
                                >
                                    <span>{isEditMode ? '❌' : '✏️'}</span>
                                    {isEditMode ? 'Hủy sửa' : 'Chế độ sửa'}
                                </button>
                                <button 
                                    onClick={() => { 
                                        setIsDeleteMode(!isDeleteMode); 
                                        setIsEditMode(false); 
                                    }} 
                                    className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2 ${
                                        isDeleteMode 
                                            ? 'bg-gray-500 text-white hover:bg-gray-600' 
                                            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                                    }`}
                                >
                                    <span>{isDeleteMode ? '❌' : '🗑️'}</span>
                                    {isDeleteMode ? 'Hủy xóa' : 'Chế độ xóa'}
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
                                onClick={fetchParkingModes}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                                <p className="text-lg text-gray-600 font-medium">Đang tải dữ liệu...</p>
                            </div>
                        </div>
                    )}

                    {/* Parking Modes Grid */}
                    {!error && !isLoading && (
                        <>
                            {currentItems.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {currentItems.map((parkingMode, index) => (
                                        <div 
                                            key={parkingMode.maHinhThuc}
                                            className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:scale-105 border border-gray-100 cursor-pointer ${
                                                isDeleteMode ? 'hover:bg-red-50 hover:border-red-200' : ''
                                            } ${
                                                isEditMode ? 'hover:bg-blue-50 hover:border-blue-200' : ''
                                            }`}
                                            onClick={() => handleRowClick(parkingMode)}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                                                        🚗
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                                                            {parkingMode.tenHinhThuc}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {parkingMode.maHinhThuc}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                    #{indexOfFirstItem + index + 1}
                                                </span>
                                            </div>

                                            <div className="space-y-3 mb-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">Mã hình thức:</span>
                                                    <span className="font-semibold text-gray-800 bg-gray-50 px-2 py-1 rounded">
                                                        {parkingMode.maHinhThuc}
                                                    </span>
                                                </div>
                                                
                                                <div className="pt-2 border-t border-gray-100">
                                                    <span className="text-gray-600 font-medium">📝 Tên hình thức: </span>
                                                    <span className="text-sm text-gray-700 font-medium">{parkingMode.tenHinhThuc}</span>
                                                </div>
                                            </div>

                                            {/* Action Indicators */}
                                            {(isEditMode || isDeleteMode) && (
                                                <div className="pt-4 border-t border-gray-100 text-center">
                                                    <span className={`text-sm font-medium ${
                                                        isDeleteMode ? 'text-red-600' : 'text-blue-600'
                                                    }`}>
                                                        {isDeleteMode ? '🗑️ Click để xóa' : '✏️ Click để chỉnh sửa'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">🚗</div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy hình thức đỗ xe</h3>
                                    <p className="text-gray-600 mb-4">
                                        {searchTerm ? 
                                            'Không có hình thức đỗ xe nào phù hợp với tiêu chí tìm kiếm' : 
                                            'Chưa có hình thức đỗ xe nào trong hệ thống'
                                        }
                                    </p>
                                    {!searchTerm && (
                                        <button
                                            onClick={() => setIsAddModalOpen(true)}
                                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                                        >
                                            ➕ Thêm hình thức đầu tiên
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 bg-white rounded-lg shadow-md p-4">
                                    <div className="text-sm text-gray-600">
                                        Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, parkingModes.length)} trong tổng số {parkingModes.length} hình thức
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {currentPage > 1 && (
                                            <button 
                                                onClick={() => setCurrentPage(p => p - 1)} 
                                                className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-all duration-200"
                                            >
                                                ← Trước
                                            </button>
                                        )}
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button 
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                    currentPage === page 
                                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                                                        : 'text-blue-600 bg-white border border-blue-300 hover:bg-blue-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        {currentPage < totalPages && (
                                            <button 
                                                onClick={() => setCurrentPage(p => p + 1)} 
                                                className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-all duration-200"
                                            >
                                                Tiếp →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Modals */}
                {isEditModalOpen && selectedParkingMode && (
                    <EditParkingModeModal
                        isOpen={isEditModalOpen}
                        isSubmitting={isLoading}
                        parkingMode={selectedParkingMode}
                        onSave={handleUpdateParkingMode}
                        onClose={closeModals}
                    />
                )}

                {isAddModalOpen && (
                    <AddParkingModeModal
                        isOpen={isAddModalOpen}
                        isSubmitting={isLoading}
                        onSave={handleAddParkingMode}
                        onClose={closeModals}
                    />
                )}

                <ConfirmationPopup
                    isOpen={isDeletePopupOpen && selectedParkingMode}
                    message={selectedParkingMode ? `Bạn có chắc chắn muốn xóa hình thức đỗ xe "${selectedParkingMode.tenHinhThuc}" (${selectedParkingMode.maHinhThuc})?` : ''}
                    onConfirm={handleDeleteParkingMode}
                    onClose={closeModals}
                    isLoading={isLoading}
                />
            </div>
        </>
    );
};

export default ParkingModePage;
