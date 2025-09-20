import React, { useState, useEffect } from 'react';
import dangKyThangService from '../../services/dangKyThangService';

const ExtensionChainModal = ({ isOpen, onClose, dangKy }) => {
    const [extensionChain, setExtensionChain] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && dangKy?.id) {
            fetchExtensionChain();
        }
    }, [isOpen, dangKy]);

    const fetchExtensionChain = async () => {
        setLoading(true);
        setError('');
        try {
            // Tìm root ID: nếu là bản gốc thì dùng chính nó, nếu không thì dùng parentId
            const rootId = dangKy.parentId || dangKy.id;
            console.log('🔍 Fetching extension chain for rootId:', rootId);
            console.log('🔍 Current dangKy:', dangKy);
            console.log('🔍 Is root?', !dangKy.parentId, 'lanGiaHan:', dangKy.lanGiaHan);
            
            // Gọi API để lấy chuỗi gia hạn
            const result = await dangKyThangService.getExtensionChain(rootId);
            console.log('🔍 Extension chain result:', result);
            
            if (result.success) {
                const chainData = result.data || [];
                console.log('🔍 Chain data length:', chainData.length);
                console.log('🔍 Chain data:', chainData);
                
                // Sắp xếp theo lanGiaHan để đảm bảo thứ tự đúng
                const sortedChain = chainData.sort((a, b) => (a.lanGiaHan || 0) - (b.lanGiaHan || 0));
                console.log('🔍 Sorted chain:', sortedChain);
                
                setExtensionChain(sortedChain);
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error('Error fetching extension chain:', error);
            setError('Có lỗi xảy ra khi tải chuỗi gia hạn');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistoryForComparison = async () => {
        setLoading(true);
        try {
            console.log('🔍 Fetching history for comparison, biển số:', dangKy.bienSoXe);
            
            // Gọi API lịch sử xe để so sánh
            const result = await dangKyThangService.getHistoryByBienSoXe(dangKy.bienSoXe);
            console.log('🔍 History API result:', result);
            
            if (result.success) {
                const historyData = result.data || [];
                console.log('🔍 History data length:', historyData.length);
                console.log('🔍 History data:', historyData);
                
                // So sánh với extension chain hiện tại
                console.log('🔍 Current extension chain length:', extensionChain.length);
                console.log('🔍 Missing in extension chain:', 
                    historyData.filter(h => !extensionChain.find(e => e.id === h.id))
                );
                
                alert(`So sánh kết quả:\n- Extension Chain API: ${extensionChain.length} bản ghi\n- History API: ${historyData.length} bản ghi\n\nKiểm tra console để xem chi tiết!`);
            } else {
                alert('Lỗi khi gọi History API: ' + result.message);
            }
        } catch (error) {
            console.error('Error fetching history for comparison:', error);
            alert('Lỗi khi so sánh với History API');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setExtensionChain([]);
        setError('');
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'ACTIVE':
                return 'bg-green-100 text-green-800 border border-green-200';
            case 'EXPIRED':
                return 'bg-red-100 text-red-800 border border-red-200';
            case 'CANCELLED':
                return 'bg-gray-100 text-gray-800 border border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ xử lý';
            case 'ACTIVE':
                return 'Còn hiệu lực';
            case 'EXPIRED':
                return 'Hết hạn';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        🔗 Chuỗi gia hạn đăng ký
                    </h2>
                    <button 
                        type="button" 
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
                        onClick={handleClose}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-600 font-medium">Đang tải chuỗi gia hạn...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-red-800">{error}</span>
                            </div>
                        </div>
                    )}

                    {!loading && !error && extensionChain.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-600 text-lg font-medium">Không có dữ liệu chuỗi gia hạn</p>
                            <p className="text-gray-500 text-sm mt-2">Đăng ký này chưa có lịch sử gia hạn</p>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="space-y-4">
                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-blue-800 mb-2">Thông tin chuỗi gia hạn</h3>
                                        <div className="text-sm text-blue-700 space-y-1">
                                            <p>Hiển thị toàn bộ lịch sử từ đăng ký gốc đến các lần gia hạn.</p>
                                            <p>Tổng cộng có <strong>{extensionChain.length}</strong> bản ghi.</p>
                                            <p>Root ID được sử dụng: <strong>{dangKy.parentId || dangKy.id}</strong></p>
                                            <p>Biển số xe: <strong>{dangKy.bienSoXe}</strong></p>
                                            {extensionChain.length > 0 && (
                                                <p>Lần gia hạn cao nhất: <strong>{Math.max(...extensionChain.map(item => item.lanGiaHan || 0))}</strong></p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={fetchExtensionChain}
                                            disabled={loading}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Làm mới
                                        </button>
                                        <button
                                            onClick={fetchHistoryForComparison}
                                            disabled={loading}
                                            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            So sánh History API
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {extensionChain.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-600 text-lg font-medium">Không có dữ liệu chuỗi gia hạn</p>
                                    <p className="text-gray-500 text-sm mt-2">Đăng ký này chưa có lịch sử gia hạn hoặc API chưa trả về đầy đủ dữ liệu</p>
                                </div>
                            ) : (
                                <div className="relative">
                                {extensionChain
                                    .sort((a, b) => (a.lanGiaHan || 0) - (b.lanGiaHan || 0))
                                    .map((item, index) => (
                                    <div key={item.id || index} className="relative flex items-start mb-6">
                                        {/* Timeline Line */}
                                        {index < extensionChain.length - 1 && (
                                            <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-300"></div>
                                        )}
                                        
                                        {/* Timeline Dot */}
                                        <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                            (item.lanGiaHan || 0) === 0 ? 'bg-blue-500' : 'bg-green-500'
                                        }`}>
                                            {(item.lanGiaHan || 0) === 0 ? '0' : (item.lanGiaHan || index + 1)}
                                        </div>

                                        {/* Content Card */}
                                        <div className="ml-6 flex-1 bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                                    {(item.lanGiaHan || 0) === 0 ? '📋 Đăng ký gốc' : `🔄 Gia hạn lần ${item.lanGiaHan}`}
                                                </h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(item.trangThai)}`}>
                                                    {getStatusText(item.trangThai)}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Ngày bắt đầu:</span>
                                                        <span className="text-sm font-medium">{formatDateTime(item.thoiGianBatDau)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Ngày kết thúc:</span>
                                                        <span className="text-sm font-medium">{formatDateTime(item.thoiGianHetHan)}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Số tháng:</span>
                                                        <span className="text-sm font-medium">{item.soThang} tháng</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Số tiền:</span>
                                                        <span className="text-sm font-medium text-green-600">{formatCurrency(item.soTienThanhToan)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Lần gia hạn:</span>
                                                        <span className="text-sm font-medium">{item.lanGiaHan || 0}</span>
                                                    </div>
                                                    {item.parentId && (
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">ID gốc:</span>
                                                            <span className="text-sm font-medium">{item.parentId}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {item.ghiChu && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <span className="text-sm text-gray-600">Ghi chú: </span>
                                                    <span className="text-sm text-gray-800">{item.ghiChu}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6">
                    <button
                        onClick={handleClose}
                        className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExtensionChainModal;