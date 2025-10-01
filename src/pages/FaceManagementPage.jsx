import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceRecognitionService from '../services/faceRecognitionService';
import { formatConfidencePercentage } from '../types/faceRecognitionTypes';
import { useToast } from '../components/common/NotificationToast';
import DashboardNavigation from '../components/DashboardNavigation';
import Pagination from '../components/common/Pagination';
import ConfirmationPopup from '../components/common/ConfirmationPopup';

const FaceManagementPage = () => {
    const navigate = useNavigate();
    const toast = useToast();
    
    // Data state
    const [faces, setFaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [totalFaces, setTotalFaces] = useState(0);

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedFaces, setSelectedFaces] = useState([]);

    // Modal states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [faceToDelete, setFaceToDelete] = useState(null);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    // View states
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        loadFaces();
    }, [currentPage, searchTerm, sortBy, sortOrder]);

    const loadFaces = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await FaceRecognitionService.listRegisteredFaces();
            console.log('Service result:', result);
            
            if (result.success) {
                // Ensure we have an array
                let filteredFaces = Array.isArray(result.data) ? result.data : [];
                console.log('Filtered faces before search:', filteredFaces);

                // Apply search filter
                if (searchTerm) {
                    filteredFaces = filteredFaces.filter(face => 
                        face.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        face.id?.toString().includes(searchTerm) ||
                        face.description?.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }

                // Apply sorting
                if (filteredFaces.length > 0) {
                    filteredFaces.sort((a, b) => {
                        let aValue = a[sortBy] || '';
                        let bValue = b[sortBy] || '';

                        if (sortBy === 'id') {
                            aValue = parseInt(aValue) || 0;
                            bValue = parseInt(bValue) || 0;
                        } else if (sortBy === 'createdAt') {
                            aValue = new Date(aValue).getTime();
                            bValue = new Date(bValue).getTime();
                        } else {
                            aValue = aValue.toString().toLowerCase();
                            bValue = bValue.toString().toLowerCase();
                        }

                        if (sortOrder === 'asc') {
                            return aValue > bValue ? 1 : -1;
                        } else {
                            return aValue < bValue ? 1 : -1;
                        }
                    });
                }

                setTotalFaces(filteredFaces.length);
                
                // Apply pagination
                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginatedFaces = filteredFaces.slice(startIndex, startIndex + itemsPerPage);
                
                console.log('Final faces to display:', paginatedFaces);
                setFaces(paginatedFaces);
            } else {
                console.error('Service returned error:', result.error);
                setError(result.error || 'Không thể tải danh sách khuôn mặt');
                toast?.showError(
                    result.error || 'Không thể tải danh sách',
                    'Lỗi tải dữ liệu'
                );
            }
        } catch (error) {
            console.error('Load faces error:', error);
            setError('Có lỗi xảy ra khi tải danh sách khuôn mặt');
            toast?.showError(
                'Có lỗi xảy ra khi tải dữ liệu',
                'Lỗi hệ thống',
                error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    const handleSelectFace = (faceId) => {
        setSelectedFaces(prev => {
            if (prev.includes(faceId)) {
                return prev.filter(id => id !== faceId);
            } else {
                return [...prev, faceId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedFaces.length === faces.length) {
            setSelectedFaces([]);
        } else {
            setSelectedFaces(faces.map(face => face.id));
        }
    };

    const handleDeleteFace = async (faceId) => {
        try {
            const result = await FaceRecognitionService.deleteFace(faceId);
            
            if (result.success) {
                toast?.showSuccess(
                    'Đã xóa khuôn mặt thành công',
                    'Xóa thành công'
                );
                
                // Remove from selected list if present
                setSelectedFaces(prev => prev.filter(id => id !== faceId));
                
                // Reload the list
                await loadFaces();
            } else {
                toast?.showError(
                    result.error || 'Không thể xóa khuôn mặt',
                    'Lỗi xóa'
                );
            }
        } catch (error) {
            console.error('Delete face error:', error);
            toast?.showError(
                'Có lỗi xảy ra khi xóa khuôn mặt',
                'Lỗi hệ thống',
                error.message
            );
        }
    };

    const handleBulkDelete = async () => {
        if (selectedFaces.length === 0) return;

        try {
            const deletePromises = selectedFaces.map(faceId => 
                FaceRecognitionService.deleteFace(faceId)
            );
            
            const results = await Promise.all(deletePromises);
            const successCount = results.filter(result => result.success).length;
            const failCount = results.length - successCount;

            if (successCount > 0) {
                toast?.showSuccess(
                    `Đã xóa ${successCount} khuôn mặt thành công`,
                    'Xóa hàng loạt thành công',
                    failCount > 0 ? `${failCount} khuôn mặt không thể xóa` : undefined
                );
            }

            if (failCount > 0) {
                toast?.showWarning(
                    `${failCount} khuôn mặt không thể xóa`,
                    'Xóa một phần'
                );
            }

            setSelectedFaces([]);
            await loadFaces();
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast?.showError(
                'Có lỗi xảy ra khi xóa hàng loạt',
                'Lỗi hệ thống',
                error.message
            );
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Không rõ';
        try {
            return new Date(dateString).toLocaleString('vi-VN');
        } catch {
            return 'Không rõ';
        }
    };

    const getSortIcon = (field) => {
        if (sortBy !== field) {
            return (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
            );
        }

        if (sortOrder === 'asc') {
            return (
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
            );
        } else {
            return (
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            );
        }
    };

    const renderGridView = () => {
        console.log('Rendering grid view with faces:', faces);
        if (!Array.isArray(faces)) {
            console.error('faces is not an array:', faces);
            return <div>Error: Invalid data format</div>;
        }
        
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {faces.map((face) => (
                    <div key={face.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                        <div className="p-4">
                            {/* Selection checkbox */}
                            <div className="flex items-center justify-between mb-3">
                                <input
                                    type="checkbox"
                                    checked={selectedFaces.includes(face.id)}
                                    onChange={() => handleSelectFace(face.id)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs text-gray-500">#{face.id}</span>
                            </div>

                        {/* Face image placeholder */}
                        <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>

                        {/* Face info */}
                        <div className="space-y-2">
                            <h3 className="font-medium text-gray-900 truncate">{face.name || 'Không có tên'}</h3>
                            {face.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">{face.description}</p>
                            )}
                            <p className="text-xs text-gray-500">
                                Đăng ký: {formatDate(face.createdAt)}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                onClick={() => {
                                    setFaceToDelete(face);
                                    setShowDeleteConfirm(true);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderListView = () => (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left">
                            <input
                                type="checkbox"
                                checked={faces.length > 0 && selectedFaces.length === faces.length}
                                onChange={handleSelectAll}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </th>
                        <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('id')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>ID</span>
                                {getSortIcon('id')}
                            </div>
                        </th>
                        <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('name')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Tên</span>
                                {getSortIcon('name')}
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mô tả
                        </th>
                        <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('createdAt')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Ngày đăng ký</span>
                                {getSortIcon('createdAt')}
                            </div>
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thao tác
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {faces.map((face) => (
                        <tr key={face.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                    type="checkbox"
                                    checked={selectedFaces.includes(face.id)}
                                    onChange={() => handleSelectFace(face.id)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                #{face.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8">
                                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-sm font-medium text-gray-900">
                                            {face.name || 'Không có tên'}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                {face.description || 'Không có mô tả'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatDate(face.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => {
                                        setFaceToDelete(face);
                                        setShowDeleteConfirm(true);
                                    }}
                                    className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                    title="Xóa"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardNavigation />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Quản lý khuôn mặt</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Quản lý danh sách khuôn mặt đã đăng ký trong hệ thống
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => navigate('/face-registration')}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Đăng ký mới
                            </button>
                            <button
                                onClick={() => navigate('/face-recognition')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Nhận diện
                            </button>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                        {/* Search */}
                        <div className="flex-1 max-w-lg">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên, ID hoặc mô tả..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Hiển thị:</span>
                            <div className="flex rounded-md shadow-sm">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                                        viewMode === 'grid'
                                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                                        viewMode === 'list'
                                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedFaces.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">
                                    Đã chọn {selectedFaces.length}
                                </span>
                                <button
                                    onClick={() => setShowBulkDeleteConfirm(true)}
                                    className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Xóa
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Đang tải danh sách...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-800 font-medium mb-2">Không thể tải danh sách khuôn mặt</p>
                        <p className="text-red-600 text-sm mb-4">{error}</p>
                        <button
                            onClick={loadFaces}
                            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Thử lại
                        </button>
                    </div>
                )}

                {!loading && !error && faces.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có khuôn mặt nào'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm 
                                ? `Không tìm thấy khuôn mặt nào khớp với "${searchTerm}"`
                                : 'Bắt đầu bằng cách đăng ký khuôn mặt đầu tiên'
                            }
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => navigate('/face-registration')}
                                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Đăng ký khuôn mặt mới
                            </button>
                        )}
                    </div>
                )}

                {!loading && !error && Array.isArray(faces) && faces.length > 0 && (
                    <>
                        {/* Results Info */}
                        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
                            <span>
                                Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalFaces)} của {totalFaces} khuôn mặt
                            </span>
                            {searchTerm && (
                                <span>
                                    Kết quả tìm kiếm cho: "<strong>{searchTerm}</strong>"
                                </span>
                            )}
                        </div>

                        {/* Face List */}
                        {viewMode === 'grid' ? renderGridView() : renderListView()}

                        {/* Pagination */}
                        {totalFaces > itemsPerPage && (
                            <div className="mt-8">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={Math.ceil(totalFaces / itemsPerPage)}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && faceToDelete && (
                <ConfirmationPopup
                    title="Xác nhận xóa khuôn mặt"
                    message={`Bạn có chắc chắn muốn xóa khuôn mặt "${faceToDelete.name || 'Không có tên'}" (ID: ${faceToDelete.id})?`}
                    confirmText="Xóa"
                    cancelText="Hủy"
                    confirmButtonStyle="bg-red-600 hover:bg-red-700 text-white"
                    onConfirm={async () => {
                        await handleDeleteFace(faceToDelete.id);
                        setShowDeleteConfirm(false);
                        setFaceToDelete(null);
                    }}
                    onCancel={() => {
                        setShowDeleteConfirm(false);
                        setFaceToDelete(null);
                    }}
                />
            )}

            {/* Bulk Delete Confirmation Modal */}
            {showBulkDeleteConfirm && (
                <ConfirmationPopup
                    title="Xác nhận xóa hàng loạt"
                    message={`Bạn có chắc chắn muốn xóa ${selectedFaces.length} khuôn mặt đã chọn?`}
                    confirmText="Xóa tất cả"
                    cancelText="Hủy"
                    confirmButtonStyle="bg-red-600 hover:bg-red-700 text-white"
                    onConfirm={async () => {
                        await handleBulkDelete();
                        setShowBulkDeleteConfirm(false);
                    }}
                    onCancel={() => {
                        setShowBulkDeleteConfirm(false);
                    }}
                />
            )}
        </div>
    );
};

export default FaceManagementPage;