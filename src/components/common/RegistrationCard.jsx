import React from 'react';
import { 
    formatCurrency, 
    formatDate, 
    hasPendingExtension,
    REGISTRATION_STATUS 
} from '../../types/extensionTypes';

const RegistrationCard = ({ 
    registration, 
    pendingRequests = [], 
    onExtensionRequest, 
    showDetails = true 
}) => {
    const isPendingExtension = hasPendingExtension(registration.id, pendingRequests);
    const isActive = registration.trangThai === REGISTRATION_STATUS.ACTIVE;
    
    // Determine status color
    const getStatusColor = () => {
        if (!isActive) return 'bg-gray-100 text-gray-800';
        
        if (registration.daysUntilExpiry > 30) {
            return 'bg-green-100 text-green-800';
        } else if (registration.daysUntilExpiry > 7) {
            return 'bg-yellow-100 text-yellow-800';
        } else {
            return 'bg-red-100 text-red-800';
        }
    };

    const getExpiryColor = () => {
        if (!isActive) return 'text-gray-600';
        
        if (registration.daysUntilExpiry > 30) {
            return 'text-green-600';
        } else if (registration.daysUntilExpiry > 7) {
            return 'text-yellow-600';
        } else {
            return 'text-red-600';
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                        {registration.bienSoXe}
                    </h3>
                    <p className="text-gray-600 text-sm">{registration.tenXe}</p>
                </div>
                <div className="flex items-center space-x-2">
                    {/* Status Badge */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                        {registration.trangThai}
                    </span>
                    
                    {/* Pending Extension Badge */}
                    {isPendingExtension && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Chờ duyệt GH
                        </span>
                    )}
                </div>
            </div>

            {/* Details */}
            {showDetails && (
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Thời hạn:</span>
                        <span className="text-gray-900">
                            {registration.soThang} tháng
                        </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Số tiền:</span>
                        <span className="text-gray-900 font-medium">
                            {formatCurrency(registration.soTienThanhToan)}
                        </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Bắt đầu:</span>
                        <span className="text-gray-900">
                            {formatDate(registration.thoiGianBatDau)}
                        </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Hết hạn:</span>
                        <span className="text-gray-900">
                            {formatDate(registration.thoiGianHetHan)}
                        </span>
                    </div>
                    
                    {isActive && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Còn lại:</span>
                            <span className={`font-medium ${getExpiryColor()}`}>
                                {registration.daysUntilExpiry} ngày
                            </span>
                        </div>
                    )}
                    
                    {registration.ghiChu && (
                        <div className="text-sm">
                            <span className="text-gray-500">Ghi chú:</span>
                            <p className="text-gray-700 mt-1 italic">"{registration.ghiChu}"</p>
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
                {isActive && (
                    <>
                        <button
                            onClick={() => onExtensionRequest(registration)}
                            disabled={isPendingExtension}
                            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
                                isPendingExtension
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                            title={isPendingExtension ? 'Đã có yêu cầu gia hạn đang chờ duyệt' : 'Yêu cầu gia hạn đăng ký'}
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {isPendingExtension ? 'Đang chờ duyệt' : 'Yêu cầu gia hạn'}
                        </button>
                    </>
                )}
                
                {!isActive && (
                    <div className="flex-1 text-center py-2 text-sm text-gray-500">
                        Đăng ký không còn hiệu lực
                    </div>
                )}
            </div>

            {/* Warning for soon-to-expire registrations */}
            {isActive && registration.daysUntilExpiry <= 7 && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-red-700">
                            <strong>Cảnh báo:</strong> Đăng ký sắp hết hạn! Hãy gia hạn sớm để tránh gián đoạn.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistrationCard;