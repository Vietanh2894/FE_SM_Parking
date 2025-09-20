import React, { useState, useEffect } from 'react';
import ParkingTransactionService from '../../services/parkingTransactionService';
import Toast from '../common/Toast';

const VehicleExitModal = ({ isOpen, onClose, onSuccess }) => {
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [vehiclesInParking, setVehiclesInParking] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingVehicles, setLoadingVehicles] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [calculatedFee, setCalculatedFee] = useState(null);
    const [confirmationStep, setConfirmationStep] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Fetch vehicles currently in parking when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchVehiclesInParking();
        }
    }, [isOpen]);

    const fetchVehiclesInParking = async () => {
        setLoadingVehicles(true);
        try {
            const response = await ParkingTransactionService.getVehiclesInParking();
            if (response.success) {
                setVehiclesInParking(response.data);
            } else {
                showToast('Không thể tải danh sách xe trong bãi', 'error');
            }
        } catch (error) {
            console.error('Error fetching vehicles in parking:', error);
            showToast('Lỗi khi tải danh sách xe trong bãi', 'error');
        } finally {
            setLoadingVehicles(false);
        }
    };

    const handleVehicleSelect = async (transactionId) => {
        const transaction = vehiclesInParking.find(t => t.maGiaoDich === parseInt(transactionId));
        if (transaction) {
            setSelectedTransaction(transaction);
            setConfirmationStep(true);
            
            // Calculate parking duration and estimated fee
            const duration = calculateParkingDuration(transaction.thoiGianVao);
            const estimatedFee = estimateParkingFee(transaction, duration);
            setCalculatedFee(estimatedFee);
        }
    };

    const calculateParkingDuration = (entryTime) => {
        const entry = new Date(entryTime);
        const now = new Date();
        const diffMs = now - entry;
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60)); // Round up to next hour
        return Math.max(1, diffHours); // Minimum 1 hour
    };

    const estimateParkingFee = (transaction, durationHours) => {
        // Basic fee estimation (you can make this more sophisticated)
        const baseRate = transaction.vehicleType?.maLoaiXe === 'LX001' ? 5000 : 15000; // Xe máy: 5k/h, Ô tô: 15k/h
        return baseRate * durationHours;
    };

    const handleConfirmExit = async () => {
        if (!selectedTransaction) {
            showToast('Vui lòng chọn xe cần ra bãi', 'error');
            return;
        }

        setLoading(true);
        try {
            const exitData = {
                bienSoXe: selectedTransaction.bienSoXe
            };

            const response = await ParkingTransactionService.directVehicleExit(exitData);
            
            if (response.success) {
                showToast(`Xe ra bãi thành công! Phí thanh toán: ${formatCurrency(response.soTienThanhToan)}`, 'success');
                
                // Call success callback để cập nhật danh sách
                if (onSuccess) {
                    onSuccess(response.data);
                }
                
                // Reset và đóng modal sau 2s để user thấy thông báo
                setTimeout(() => {
                    handleReset();
                    onClose();
                }, 2000);
            } else {
                showToast(response.message || 'Có lỗi xảy ra khi cho xe ra bãi', 'error');
            }
        } catch (error) {
            console.error('Error processing vehicle exit:', error);
            showToast(
                error.response?.data?.message || 
                error.response?.data?.error || 
                'Có lỗi xảy ra khi cho xe ra bãi', 
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedTransaction(null);
        setVehiclesInParking([]);
        setCalculatedFee(null);
        setConfirmationStep(false);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0 VNĐ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return '';
        return new Date(dateTime).toLocaleString('vi-VN');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-medium text-gray-900">
                        Cho xe ra bãi đỗ
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
                <div className="p-6">
                    {!confirmationStep ? (
                        // Step 1: Select vehicle from list
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Chọn xe cần cho ra bãi
                                </label>
                                
                                {loadingVehicles ? (
                                    <div className="flex items-center justify-center py-8">
                                        <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="ml-2 text-gray-600">Đang tải danh sách xe...</span>
                                    </div>
                                ) : vehiclesInParking.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-gray-500">
                                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8v2a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1h10a1 1 0 011 1z" />
                                            </svg>
                                            <p>Không có xe nào trong bãi đỗ</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {vehiclesInParking.map((transaction) => (
                                            <div
                                                key={transaction.maGiaoDich}
                                                onClick={() => handleVehicleSelect(transaction.maGiaoDich)}
                                                className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                                                                {transaction.bienSoXe}
                                                            </div>
                                                            <span className="text-sm text-gray-600">
                                                                {transaction.vehicleType?.tenLoaiXe}
                                                            </span>
                                                            <span className="text-sm text-gray-600">
                                                                {transaction.parkingLot?.tenBaiDo}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 text-xs text-gray-500">
                                                            Vào lúc: {formatDateTime(transaction.thoiGianVao)} • 
                                                            Thời gian đỗ: {calculateParkingDuration(transaction.thoiGianVao)} giờ
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            Ước tính: {formatCurrency(estimateParkingFee(transaction, calculateParkingDuration(transaction.thoiGianVao)))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Step 2: Confirmation with vehicle details and payment
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-3">Thông tin xe ra bãi</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Biển số xe:</span>
                                        <div className="font-medium">{selectedTransaction?.bienSoXe}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Loại xe:</span>
                                        <div className="font-medium">{selectedTransaction?.vehicleType?.tenLoaiXe}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Bãi đỗ:</span>
                                        <div className="font-medium">{selectedTransaction?.parkingLot?.tenBaiDo}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Thời gian vào:</span>
                                        <div className="font-medium">{formatDateTime(selectedTransaction?.thoiGianVao)}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Thời gian đỗ:</span>
                                        <div className="font-medium">{calculateParkingDuration(selectedTransaction?.thoiGianVao)} giờ</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Ước tính phí:</span>
                                        <div className="font-medium text-blue-600">{formatCurrency(calculatedFee)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm text-yellow-800">
                                        Phí thực tế sẽ được tính toán chính xác bởi hệ thống khi xử lý
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
                    {!confirmationStep ? (
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                        >
                            Đóng
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setConfirmationStep(false)}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={handleConfirmExit}
                                disabled={loading}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Xác nhận cho xe ra'
                                )}
                            </button>
                        </>
                    )}
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

export default VehicleExitModal;
