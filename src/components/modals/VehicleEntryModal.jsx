import React, { useState, useEffect } from 'react';
import ParkingTransactionService from '../../services/parkingTransactionService';
import Toast from '../common/Toast';

const VehicleEntryModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        bienSoXe: '',
        maBaiDo: '',
        maLoaiXe: '',
        ghiChu: 'Scan từ camera'
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [vehicleStatus, setVehicleStatus] = useState(null);
    const [checkingStatus, setCheckingStatus] = useState(false);

    // Parking lots và vehicle types từ backend API thực
    const [parkingLots] = useState([
        { maBaiDo: 'P001', tenBaiDo: 'Bãi đỗ xe máy', maLoaiXe: 'LX001' },
        { maBaiDo: 'P002', tenBaiDo: 'Bãi đỗ xe ô tô', maLoaiXe: 'LX002' }
    ]);

    const [vehicleTypes] = useState([
        { maLoaiXe: 'LX001', tenLoaiXe: 'Xe máy' },
        { maLoaiXe: 'LX002', tenLoaiXe: 'Xe ô tô' }
    ]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: name === 'bienSoXe' ? value.toUpperCase() : value
            };

            // Tự động set bãi đỗ phù hợp khi chọn loại xe
            if (name === 'maLoaiXe') {
                if (value === 'LX001') { // Xe máy
                    newData.maBaiDo = 'P001';
                } else if (value === 'LX002') { // Xe ô tô
                    newData.maBaiDo = 'P002';
                }
                // Set ghi chú mặc định
                newData.ghiChu = 'Scan từ camera';
            }

            return newData;
        });

        // Auto check vehicle status when license plate is entered
        if (name === 'bienSoXe' && value.length >= 6) {
            checkVehicleStatus(value);
        }
    };

    const checkVehicleStatus = async (bienSoXe) => {
        if (!bienSoXe.trim()) return;

        setCheckingStatus(true);
        try {
            const response = await ParkingTransactionService.checkVehicleStatus(bienSoXe.trim());
            if (response.success) {
                setVehicleStatus(response);
                
                if (response.isCurrentlyParked) {
                    showToast('Xe đang đỗ trong bãi, không thể cho vào thêm!', 'error');
                } else if (response.hasActiveMonthlyRegistration) {
                    showToast('Xe có đăng ký tháng - Sẽ được miễn phí!', 'success');
                } else {
                    showToast('Xe vãng lai - Sẽ tính phí theo giờ', 'info');
                }
            }
        } catch (error) {
            console.error('Error checking vehicle status:', error);
            setVehicleStatus(null);
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.bienSoXe.trim()) {
            showToast('Vui lòng nhập biển số xe', 'error');
            return;
        }
        if (!formData.maBaiDo) {
            showToast('Vui lòng chọn bãi đỗ', 'error');
            return;
        }
        if (!formData.maLoaiXe) {
            showToast('Vui lòng chọn loại xe', 'error');
            return;
        }

        // Check if vehicle is already parked
        if (vehicleStatus && vehicleStatus.isCurrentlyParked) {
            showToast('Xe đang đỗ trong bãi, không thể cho vào!', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await ParkingTransactionService.directVehicleEntry(formData);
            
            if (response.success) {
                showToast('Cho xe vào bãi đỗ thành công!', 'success');
                
                // Call success callback để cập nhật danh sách
                if (onSuccess) {
                    onSuccess(response.data); // response.data chứa transaction data
                }
                
                // Reset form và đóng modal sau 1.5s để user thấy thông báo thành công
                setTimeout(() => {
                    handleReset();
                    onClose();
                }, 1500);
            } else {
                showToast(response.message || 'Có lỗi xảy ra khi cho xe vào', 'error');
            }
        } catch (error) {
            console.error('Error creating vehicle entry:', error);
            showToast(
                error.response?.data?.message || 
                error.response?.data?.error || 
                'Có lỗi xảy ra khi cho xe vào', 
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            bienSoXe: '',
            maBaiDo: '',
            maLoaiXe: '',
            ghiChu: 'Scan từ camera'
        });
        setVehicleStatus(null);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    // Filter parking lots based on selected vehicle type
    const filteredParkingLots = parkingLots.filter(lot => 
        !formData.maLoaiXe || lot.maLoaiXe === formData.maLoaiXe
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Cho xe vào bãi đỗ
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
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Biển số xe */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Biển số xe *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="bienSoXe"
                                value={formData.bienSoXe}
                                onChange={handleInputChange}
                                placeholder="VD: 29A-12345"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                autoFocus
                                maxLength={15}
                            />
                            {checkingStatus && (
                                <div className="absolute right-3 top-2">
                                    <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            )}
                        </div>
                        
                        {/* Vehicle status display */}
                        {vehicleStatus && (
                            <div className={`mt-2 p-3 rounded-md text-sm ${
                                vehicleStatus.isCurrentlyParked 
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : vehicleStatus.hasActiveMonthlyRegistration
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                                <div className="flex items-center">
                                    {vehicleStatus.isCurrentlyParked ? (
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    ) : vehicleStatus.hasActiveMonthlyRegistration ? (
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    {vehicleStatus.message}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Loại xe */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại xe *
                        </label>
                        <select
                            name="maLoaiXe"
                            value={formData.maLoaiXe}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="">Chọn loại xe</option>
                            {vehicleTypes.map(type => (
                                <option key={type.maLoaiXe} value={type.maLoaiXe}>
                                    {type.tenLoaiXe}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Bãi đỗ */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bãi đỗ *
                        </label>
                        <select
                            name="maBaiDo"
                            value={formData.maBaiDo}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            disabled={!formData.maLoaiXe}
                        >
                            <option value="">
                                {!formData.maLoaiXe ? 'Vui lòng chọn loại xe trước' : 'Chọn bãi đỗ'}
                            </option>
                            {filteredParkingLots.map(lot => (
                                <option key={lot.maBaiDo} value={lot.maBaiDo}>
                                    {lot.tenBaiDo}
                                </option>
                            ))}
                        </select>
                        {formData.maLoaiXe && filteredParkingLots.length === 0 && (
                            <p className="mt-1 text-sm text-red-600">
                                Không có bãi đỗ phù hợp cho loại xe này
                            </p>
                        )}
                    </div>

                    {/* Ghi chú */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú
                        </label>
                        <textarea
                            name="ghiChu"
                            value={formData.ghiChu}
                            onChange={handleInputChange}
                            placeholder="Ghi chú thêm (tùy chọn)"
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                        >
                            Xóa
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={
                                loading || 
                                !formData.bienSoXe.trim() || 
                                !formData.maLoaiXe || 
                                !formData.maBaiDo ||
                                (vehicleStatus && vehicleStatus.isCurrentlyParked)
                            }
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center"
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
                                'Cho xe vào'
                            )}
                        </button>
                    </div>
                </form>
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

export default VehicleEntryModal;
