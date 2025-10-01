import React, { useState, useEffect } from 'react';
import UserDashboardService from '../../services/userDashboardService';
import { 
    validateExtensionRequest, 
    formatCurrency, 
    formatDate,
    REGISTRATION_STATUS
} from '../../types/extensionTypes';

const ExtensionRequestModal = ({ 
    isOpen, 
    onClose, 
    activeRegistrations = [], 
    selectedRegistration = null,
    onSuccess 
}) => {
    const [formData, setFormData] = useState({
        dangKyThangId: selectedRegistration?.id || '',
        soThangGiaHan: 1,
        ghiChu: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // Update form when selectedRegistration changes
    useEffect(() => {
        if (selectedRegistration) {
            setFormData(prev => ({
                ...prev,
                dangKyThangId: selectedRegistration.id
            }));
        }
    }, [selectedRegistration]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'dangKyThangId' || name === 'soThangGiaHan' 
                ? parseInt(value) || '' 
                : value
        }));
        
        // Clear errors when user types
        if (error) setError('');
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (loading) return;

        // Validate form
        const validation = validateExtensionRequest(formData);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            return;
        }
        
        setLoading(true);
        setError('');
        setValidationErrors({});

        try {
            console.log('🔄 Submitting extension request:', formData);
            
            const result = await UserDashboardService.requestExtension(
                formData.dangKyThangId,
                formData.soThangGiaHan,
                formData.ghiChu
            );

            console.log('✅ Extension request result:', result);

            if (result.success) {
                onSuccess({
                    type: 'success',
                    message: result.message || 'Yêu cầu gia hạn đã được gửi thành công!'
                });
                handleClose();
            } else {
                setError(result.error || 'Không thể gửi yêu cầu gia hạn');
            }
        } catch (err) {
            console.error('❌ Extension request error:', err);
            setError(err.message || 'Có lỗi xảy ra khi gửi yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        
        setFormData({
            dangKyThangId: '',
            soThangGiaHan: 1,
            ghiChu: ''
        });
        setError('');
        setValidationErrors({});
        onClose();
    };

    if (!isOpen) return null;

    // Get selected registration details
    const selectedReg = activeRegistrations.find(reg => reg.id === formData.dangKyThangId);
    
    // Calculate estimated cost (assuming 120,000 VND per month)
    const estimatedCost = formData.soThangGiaHan * 120000;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Yêu cầu gia hạn đăng ký
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Chọn đăng ký - Chỉ hiển thị khi chưa có selectedRegistration */}
                    {!selectedRegistration ? (
                        <div className="mb-4">
                            <label htmlFor="dangKyThangId" className="block text-sm font-medium text-gray-700 mb-2">
                                Chọn đăng ký cần gia hạn <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="dangKyThangId"
                                name="dangKyThangId"
                                value={formData.dangKyThangId}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    validationErrors.dangKyThangId ? 'border-red-300' : 'border-gray-300'
                                }`}
                            >
                                <option value="">-- Chọn đăng ký --</option>
                                {activeRegistrations
                                    .filter(reg => reg.trangThai === 'Đang hiệu lực' || reg.active === true)
                                    .map((registration) => (
                                    <option key={registration.id} value={registration.id}>
                                        {registration.bienSoXe} - {registration.tenXe} 
                                        (Hết hạn: {formatDate(registration.thoiGianHetHan)})
                                    </option>
                                ))}
                            </select>
                            {validationErrors.dangKyThangId && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.dangKyThangId}</p>
                            )}
                        </div>
                    ) : (
                        // Hiển thị thông tin registration đã được chọn
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Đăng ký được chọn
                            </label>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-blue-900">
                                            {selectedRegistration.bienSoXe} - {selectedRegistration.tenXe}
                                        </h3>
                                        <p className="text-sm text-blue-700">
                                            Hết hạn: {formatDate(selectedRegistration.thoiGianHetHan)}
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            Còn lại: {selectedRegistration.daysUntilExpiry} ngày
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Selected Registration Info */}
                    {selectedReg && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h3 className="font-medium text-gray-900 mb-2">Thông tin đăng ký</h3>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p><span className="font-medium">Biển số:</span> {selectedReg.bienSoXe}</p>
                                <p><span className="font-medium">Tên xe:</span> {selectedReg.tenXe}</p>
                                <p><span className="font-medium">Thời hạn hiện tại:</span> {formatDate(selectedReg.thoiGianHetHan)}</p>
                                <p><span className="font-medium">Còn lại:</span> 
                                    <span className={`ml-1 ${
                                        selectedReg.daysUntilExpiry > 30 
                                            ? 'text-green-600' 
                                            : selectedReg.daysUntilExpiry > 7
                                            ? 'text-yellow-600'
                                            : 'text-red-600'
                                    }`}>
                                        {selectedReg.daysUntilExpiry} ngày
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Số tháng gia hạn */}
                    <div className="mb-4">
                        <label htmlFor="soThangGiaHan" className="block text-sm font-medium text-gray-700 mb-2">
                            Số tháng gia hạn <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="soThangGiaHan"
                            name="soThangGiaHan"
                            value={formData.soThangGiaHan}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50 ${
                                validationErrors.soThangGiaHan ? 'border-red-300' : 'border-gray-300'
                            }`}
                        >
                            {[...Array(12)].map((_, index) => (
                                <option key={index + 1} value={index + 1}>
                                    {index + 1} tháng
                                </option>
                            ))}
                        </select>
                        {validationErrors.soThangGiaHan && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.soThangGiaHan}</p>
                        )}
                    </div>

                    {/* Estimated Cost */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-700">Ước tính chi phí:</span>
                            <span className="font-semibold text-blue-900">
                                {formatCurrency(estimatedCost)}
                            </span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                            * Chi phí chính xác sẽ được tính toán bởi hệ thống
                        </p>
                    </div>

                    {/* Ghi chú */}
                    <div className="mb-6">
                        <label htmlFor="ghiChu" className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú
                        </label>
                        <textarea
                            id="ghiChu"
                            name="ghiChu"
                            value={formData.ghiChu}
                            onChange={handleInputChange}
                            rows={3}
                            maxLength={500}
                            disabled={loading}
                            placeholder="Nhập ghi chú (tùy chọn, tối đa 500 ký tự)"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50 resize-none ${
                                validationErrors.ghiChu ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{formData.ghiChu.length}/500 ký tự</span>
                            {validationErrors.ghiChu && (
                                <span className="text-red-500">{validationErrors.ghiChu}</span>
                            )}
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.dangKyThangId}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

export default ExtensionRequestModal;