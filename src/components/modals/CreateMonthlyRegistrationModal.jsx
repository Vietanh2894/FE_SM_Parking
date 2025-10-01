import React, { useState, useEffect } from 'react';
import UserDashboardService from '../../services/userDashboardService';

const CreateMonthlyRegistrationModal = ({ 
    isOpen, 
    onClose, 
    onSuccess,
    selectedVehicle = null, // Xe được chọn từ danh sách
    userVehicles = [] // Danh sách xe của user
}) => {
    const [formData, setFormData] = useState({
        bienSoXe: '',
        soThang: 1,
        ghiChu: '',
        ngayBatDauMongMuon: '',
        soCavet: '',
        maLoaiXe: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // Reset form khi modal đóng/mở
    useEffect(() => {
        if (isOpen) {
            if (selectedVehicle) {
                // Nếu có xe được chọn, auto-fill thông tin
                setFormData({
                    bienSoXe: selectedVehicle.bienSoXe,
                    soThang: 1,
                    ghiChu: '',
                    ngayBatDauMongMuon: '',
                    soCavet: selectedVehicle.soCavet || '',
                    maLoaiXe: selectedVehicle.maLoaiXe || selectedVehicle.tenLoaiXe
                });
            } else {
                // Reset form
                setFormData({
                    bienSoXe: userVehicles.length > 0 ? userVehicles[0].bienSoXe : '',
                    soThang: 1,
                    ghiChu: '',
                    ngayBatDauMongMuon: '',
                    soCavet: userVehicles.length > 0 ? userVehicles[0].soCavet || '' : '',
                    maLoaiXe: userVehicles.length > 0 ? userVehicles[0].maLoaiXe || userVehicles[0].tenLoaiXe : ''
                });
            }
            setError('');
            setValidationErrors({});
        }
    }, [isOpen, selectedVehicle, userVehicles]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Nếu thay đổi xe, cập nhật thông tin liên quan
        if (name === 'bienSoXe') {
            const selectedVeh = userVehicles.find(v => v.bienSoXe === value);
            if (selectedVeh) {
                setFormData(prev => ({
                    ...prev,
                    [name]: value,
                    soCavet: selectedVeh.soCavet || '',
                    maLoaiXe: selectedVeh.maLoaiXe || selectedVeh.tenLoaiXe
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        
        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.bienSoXe.trim()) {
            errors.bienSoXe = 'Vui lòng chọn xe';
        }

        if (!formData.soThang || formData.soThang < 1 || formData.soThang > 12) {
            errors.soThang = 'Số tháng phải từ 1 đến 12';
        }

        if (formData.ghiChu && formData.ghiChu.length > 500) {
            errors.ghiChu = 'Ghi chú không được vượt quá 500 ký tự';
        }

        // Validate ngày bắt đầu mong muốn (nếu có)
        if (formData.ngayBatDauMongMuon) {
            const selectedDate = new Date(formData.ngayBatDauMongMuon);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                errors.ngayBatDauMongMuon = 'Ngày bắt đầu không được trong quá khứ';
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const validation = validateForm();
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            return;
        }
        
        setLoading(true);
        setError('');
        setValidationErrors({});

        try {
            console.log('🔄 Submitting monthly registration request:', formData);
            
            const result = await UserDashboardService.requestMonthlyRegistration(formData);

            console.log('✅ Monthly registration result:', result);

            if (result.success) {
                onSuccess({
                    type: 'success',
                    message: result.message || 'Yêu cầu đăng ký tháng đã được gửi thành công!'
                });
                handleClose();
            } else {
                setError(result.error || 'Không thể gửi yêu cầu đăng ký tháng');
            }
        } catch (err) {
            console.error('❌ Monthly registration request error:', err);
            setError(err.message || 'Có lỗi xảy ra khi gửi yêu cầu đăng ký tháng');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    // Get today's date for date input min value
    const getTodayString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Yêu cầu đăng ký tháng
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 p-1 disabled:opacity-50"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chọn xe */}
                    {!selectedVehicle ? (
                        <div>
                            <label htmlFor="bienSoXe" className="block text-sm font-medium text-gray-700 mb-2">
                                Chọn xe <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="bienSoXe"
                                name="bienSoXe"
                                value={formData.bienSoXe}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50 ${
                                    validationErrors.bienSoXe ? 'border-red-300' : 'border-gray-300'
                                }`}
                            >
                                <option value="">-- Chọn xe --</option>
                                {userVehicles
                                    .filter(vehicle => !vehicle.hasActiveDangKy) // Chỉ hiển thị xe chưa có đăng ký active
                                    .map((vehicle) => (
                                    <option key={vehicle.bienSoXe} value={vehicle.bienSoXe}>
                                        {vehicle.bienSoXe} - {vehicle.tenXe}
                                    </option>
                                ))}
                            </select>
                            {validationErrors.bienSoXe && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.bienSoXe}</p>
                            )}
                        </div>
                    ) : (
                        // Hiển thị thông tin xe đã được chọn
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Xe được chọn
                            </label>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-blue-900">
                                            {selectedVehicle.bienSoXe} - {selectedVehicle.tenXe}
                                        </h3>
                                        <p className="text-sm text-blue-700">
                                            Loại xe: {selectedVehicle.tenLoaiXe}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Số tháng đăng ký */}
                    <div>
                        <label htmlFor="soThang" className="block text-sm font-medium text-gray-700 mb-2">
                            Số tháng đăng ký <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="soThang"
                            name="soThang"
                            value={formData.soThang}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50 ${
                                validationErrors.soThang ? 'border-red-300' : 'border-gray-300'
                            }`}
                        >
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1} tháng
                                </option>
                            ))}
                        </select>
                        {validationErrors.soThang && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.soThang}</p>
                        )}
                    </div>

                    {/* Ngày bắt đầu mong muốn */}
                    <div>
                        <label htmlFor="ngayBatDauMongMuon" className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày bắt đầu mong muốn
                        </label>
                        <input
                            type="date"
                            id="ngayBatDauMongMuon"
                            name="ngayBatDauMongMuon"
                            value={formData.ngayBatDauMongMuon}
                            onChange={handleInputChange}
                            min={getTodayString()}
                            disabled={loading}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50 ${
                                validationErrors.ngayBatDauMongMuon ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {validationErrors.ngayBatDauMongMuon && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.ngayBatDauMongMuon}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Để trống nếu muốn bắt đầu ngay hôm nay
                        </p>
                    </div>

                    {/* Ghi chú */}
                    <div>
                        <label htmlFor="ghiChu" className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú
                        </label>
                        <textarea
                            id="ghiChu"
                            name="ghiChu"
                            value={formData.ghiChu}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Nhập ghi chú (tùy chọn, tối đa 500 ký tự)"
                            disabled={loading}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50 resize-none ${
                                validationErrors.ghiChu ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        <div className="flex justify-between mt-1">
                            {validationErrors.ghiChu && (
                                <p className="text-red-500 text-xs">{validationErrors.ghiChu}</p>
                            )}
                            <p className="text-xs text-gray-500 ml-auto">
                                {formData.ghiChu.length}/500 ký tự
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang gửi...
                                </>
                            ) : (
                                'Gửi yêu cầu'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateMonthlyRegistrationModal;