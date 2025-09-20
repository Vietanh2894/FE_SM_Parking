import React, { useState, useEffect } from 'react';
import dangKyThangService from '../../services/dangKyThangService';

const VehicleHistoryModal = ({ isOpen, onClose, dangKy }) => {
    const [bienSoXe, setBienSoXe] = useState('');
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    // Auto load lịch sử khi modal mở và có dangKy
    useEffect(() => {
        if (isOpen && dangKy?.bienSoXe) {
            setBienSoXe(dangKy.bienSoXe);
            fetchHistoryByBienSo(dangKy.bienSoXe);
        }
    }, [isOpen, dangKy]);

    const fetchHistoryByBienSo = async (licensePlate) => {
        setLoading(true);
        setError('');
        setHasSearched(true);
        
        try {
            const result = await dangKyThangService.getHistoryByBienSoXe(licensePlate);
            if (result.success) {
                setHistoryData(result.data || []);
            } else {
                setError(result.message);
                setHistoryData([]);
            }
        } catch (error) {
            console.error('Error fetching vehicle history:', error);
            setError('Có lỗi xảy ra khi tải lịch sử xe');
            setHistoryData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!bienSoXe.trim()) {
            alert('Vui lòng nhập biển số xe');
            return;
        }

        await fetchHistoryByBienSo(bienSoXe.trim());
    };

    const handleClose = () => {
        setBienSoXe('');
        setHistoryData([]);
        setError('');
        setHasSearched(false);
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

    const getTotalAmount = () => {
        return historyData.reduce((total, item) => total + (item.soTienThanhToan || 0), 0);
    };

    const getTotalMonths = () => {
        return historyData.reduce((total, item) => total + (item.soThang || 0), 0);
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
                className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        🚗 Lịch sử đăng ký xe {bienSoXe && (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
                                {bienSoXe}
                            </span>
                        )}
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
                    {/* Vehicle Info (when opened from a registration) */}
                    {dangKy && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-blue-800 mb-2">Thông tin xe được chọn</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-blue-700">Biển số xe:</span>
                                    <span className="font-medium">{dangKy.bienSoXe}</span>
                                </div>
                                {dangKy.vehicle?.tenXe && (
                                    <div className="flex justify-between">
                                        <span className="text-blue-700">Tên xe:</span>
                                        <span className="font-medium">{dangKy.vehicle.tenXe}</span>
                                    </div>
                                )}
                                {dangKy.loaiXe?.tenLoaiXe && (
                                    <div className="flex justify-between">
                                        <span className="text-blue-700">Loại xe:</span>
                                        <span className="font-medium">{dangKy.loaiXe.tenLoaiXe}</span>
                                    </div>
                                )}
                                {dangKy.vehicle?.owner?.name && (
                                    <div className="flex justify-between">
                                        <span className="text-blue-700">Chủ xe:</span>
                                        <span className="font-medium">{dangKy.vehicle.owner.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Search Form - only show when no dangKy provided */}
                    {!dangKy && (
                        <form onSubmit={handleSearch} className="mb-6">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Biển số xe <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={bienSoXe}
                                    onChange={(e) => setBienSoXe(e.target.value)}
                                    placeholder="Nhập biển số xe (VD: 30A-12345)"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700 uppercase"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang tìm...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Tìm kiếm
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                    )}

                    {/* Error Message */}
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

                    {/* No Data Message */}
                    {!loading && !error && hasSearched && historyData.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-600 text-lg font-medium">Không tìm thấy lịch sử</p>
                            <p className="text-gray-500 text-sm mt-2">
                                Biển số xe "{bienSoXe}" chưa có lịch sử đăng ký tháng nào
                            </p>
                        </div>
                    )}

                    {/* Results */}
                    {!loading && !error && historyData.length > 0 && (
                        <div className="space-y-6">
                            {/* Summary */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-800 mb-3">Tóm tắt lịch sử của xe {bienSoXe}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{historyData.length}</div>
                                        <div className="text-sm text-blue-700">Tổng số đăng ký</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{getTotalMonths()}</div>
                                        <div className="text-sm text-green-700">Tổng số tháng</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">{formatCurrency(getTotalAmount())}</div>
                                        <div className="text-sm text-purple-700">Tổng số tiền</div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="relative">
                                {historyData.map((item, index) => (
                                    <div key={item.id || index} className="relative flex items-start mb-6">
                                        {/* Timeline Line */}
                                        {index < historyData.length - 1 && (
                                            <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-300"></div>
                                        )}
                                        
                                        {/* Timeline Dot */}
                                        <div className="relative z-10 flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {index + 1}
                                        </div>

                                        {/* Content Card */}
                                        <div className="ml-6 flex-1 bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-semibold text-gray-800 text-lg">
                                                    Đăng ký #{item.id}
                                                </h4>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(item.trangThai)}`}>
                                                    {getStatusText(item.trangThai)}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <div className="text-sm text-gray-600">Xe và chủ sở hữu</div>
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium">{item.tenXe}</div>
                                                        <div className="text-xs text-gray-500">Loại xe: {item.maLoaiXe?.tenLoaiXe || 'N/A'}</div>
                                                        {item.user && (
                                                            <div className="text-xs text-gray-500">Chủ xe: {item.user.username}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <div className="text-sm text-gray-600">Thời gian</div>
                                                    <div className="space-y-1">
                                                        <div className="text-sm">
                                                            <span className="text-gray-500">Từ:</span> {formatDateTime(item.thoiGianBatDau)}
                                                        </div>
                                                        <div className="text-sm">
                                                            <span className="text-gray-500">Đến:</span> {formatDateTime(item.thoiGianHetHan)}
                                                        </div>
                                                        <div className="text-sm">
                                                            <span className="text-gray-500">Số tháng:</span> {item.soThang} tháng
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-sm text-gray-600">Thanh toán & Gia hạn</div>
                                                    <div className="space-y-1">
                                                        <div className="text-lg font-bold text-green-600">
                                                            {formatCurrency(item.soTienThanhToan)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Trạng thái: {item.trangThaiThanhToan === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                                        </div>
                                                        <div className={`px-2 py-1 text-xs font-medium rounded-md inline-block mt-1 ${
                                                            (item.lanGiaHan || 0) === 0 
                                                                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                                                : 'bg-green-100 text-green-800 border border-green-200'
                                                        }`}>
                                                            {(item.lanGiaHan || 0) === 0 ? 'Gốc' : `Lần ${item.lanGiaHan}`}
                                                        </div>
                                                        {item.parentId && (
                                                            <div className="text-xs text-gray-500">
                                                                Từ ID: {item.parentId}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {item.ghiChu && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <span className="text-sm text-gray-600">Ghi chú: </span>
                                                    <span className="text-sm text-gray-800">{item.ghiChu}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
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

export default VehicleHistoryModal;