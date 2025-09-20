import React, { useState } from 'react';
import ParkingTransactionService from '../../services/parkingTransactionService';
import Toast from '../common/Toast';

const VehicleStatusModal = ({ isOpen, onClose, onVehicleChecked }) => {
    const [bienSoXe, setBienSoXe] = useState('');
    const [loading, setLoading] = useState(false);
    const [vehicleStatus, setVehicleStatus] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleCheckStatus = async () => {
        if (!bienSoXe.trim()) {
            showToast('Vui lòng nhập biển số xe', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await ParkingTransactionService.checkVehicleStatus(bienSoXe.trim());
            
            if (response.success) {
                setVehicleStatus(response);
                showToast('Kiểm tra trạng thái xe thành công', 'success');
                
                // Gọi callback để parent component có thể xử lý
                if (onVehicleChecked) {
                    onVehicleChecked(response);
                }
            } else {
                showToast(response.error || 'Có lỗi xảy ra khi kiểm tra trạng thái xe', 'error');
            }
        } catch (error) {
            console.error('Error checking vehicle status:', error);
            showToast(
                error.response?.data?.error || 
                error.response?.data?.message || 
                'Có lỗi xảy ra khi kiểm tra trạng thái xe', 
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setBienSoXe('');
        setVehicleStatus(null);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const getStatusIcon = (status) => {
        if (status.isCurrentlyParked) {
            return (
                <div className="flex items-center text-yellow-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Xe đang đỗ trong bãi
                </div>
            );
        } else if (status.hasActiveMonthlyRegistration) {
            return (
                <div className="flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Có đăng ký tháng - Miễn phí
                </div>
            );
        } else {
            return (
                <div className="flex items-center text-blue-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                    Xe vãng lai - Tính phí theo giờ
                </div>
            );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Kiểm tra trạng thái xe
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Input biển số xe */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Biển số xe
                        </label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={bienSoXe}
                                onChange={(e) => setBienSoXe(e.target.value.toUpperCase())}
                                placeholder="VD: 29A-12345"
                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && handleCheckStatus()}
                            />
                            <button
                                onClick={handleCheckStatus}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                            >
                                {loading ? (
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Kết quả kiểm tra */}
                    {vehicleStatus && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">Biển số xe:</span>
                                <span className="font-semibold text-gray-900">{vehicleStatus.bienSoXe}</span>
                            </div>

                            <div className="border-t pt-3">
                                {getStatusIcon(vehicleStatus)}
                            </div>

                            <div className="bg-white rounded-md p-3 border">
                                <p className="text-sm text-gray-600">{vehicleStatus.message}</p>
                            </div>

                            {/* Trạng thái chi tiết */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center">
                                    <span className={`w-3 h-3 rounded-full mr-2 ${vehicleStatus.hasActiveMonthlyRegistration ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    <span className="text-gray-600">Đăng ký tháng</span>
                                </div>
                                <div className="flex items-center">
                                    <span className={`w-3 h-3 rounded-full mr-2 ${vehicleStatus.isCurrentlyParked ? 'bg-yellow-500' : 'bg-gray-300'}`}></span>
                                    <span className="text-gray-600">Đang đỗ</span>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex space-x-2 pt-3">
                                {vehicleStatus.canEnter && (
                                    <button
                                        onClick={() => {
                                            // Có thể thêm logic để mở modal cho xe vào
                                            showToast('Xe có thể vào bãi đỗ', 'success');
                                        }}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm transition-colors"
                                    >
                                        Cho xe vào
                                    </button>
                                )}
                                {vehicleStatus.isCurrentlyParked && (
                                    <button
                                        onClick={() => {
                                            // Có thể thêm logic để mở modal cho xe ra
                                            showToast('Có thể tạo yêu cầu cho xe ra', 'info');
                                        }}
                                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md text-sm transition-colors"
                                    >
                                        Cho xe ra
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    >
                        Xóa
                    </button>
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>

            {/* Toast notification */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: 'success' })}
                />
            )}
        </div>
    );
};

export default VehicleStatusModal;
