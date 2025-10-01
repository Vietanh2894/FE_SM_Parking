import React, { useState, useEffect } from 'react';
import UserDashboardService from '../../services/userDashboardService';

const CreateVehicleModal = ({ 
    isOpen, 
    onClose, 
    onSuccess,
    vehicleTypes = [] // Danh sách loại xe
}) => {
    const [formData, setFormData] = useState({
        bienSoXe: '',
        tenXe: '',
        soCavet: '',
        maLoaiXe: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // Reset form khi modal đóng/mở
    useEffect(() => {
        if (isOpen) {
            setFormData({
                bienSoXe: '',
                tenXe: '',
                soCavet: '',
                maLoaiXe: vehicleTypes.length > 0 ? vehicleTypes[0].maLoaiXe : ''
            });
            setError('');
            setValidationErrors({});
        }
    }, [isOpen, vehicleTypes]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
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
            errors.bienSoXe = 'Biển số xe không được để trống';
        } else if (formData.bienSoXe.length > 20) {
            errors.bienSoXe = 'Biển số xe không được vượt quá 20 ký tự';
        }

        if (!formData.tenXe.trim()) {
            errors.tenXe = 'Tên xe không được để trống';
        } else if (formData.tenXe.length > 100) {
            errors.tenXe = 'Tên xe không được vượt quá 100 ký tự';
        }

        if (formData.soCavet && formData.soCavet.length > 50) {
            errors.soCavet = 'Số cavet không được vượt quá 50 ký tự';
        }

        if (!formData.maLoaiXe) {
            errors.maLoaiXe = 'Vui lòng chọn loại xe';
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
            console.log('🔄 Submitting create vehicle request:', formData);
            
            const result = await UserDashboardService.createVehicle(formData);

            console.log('✅ Create vehicle result:', result);

            if (result.success) {
                onSuccess({
                    type: 'success',
                    message: result.message || 'Tạo xe mới thành công!'
                });
                handleClose();
            } else {
                setError(result.error || 'Không thể tạo xe mới');
            }
        } catch (err) {
            console.error('❌ Create vehicle error:', err);
            setError(err.message || 'Có lỗi xảy ra khi tạo xe mới');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Tạo xe mới
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

                    {/* Biển số xe */}
                    <div>
                        <label htmlFor="bienSoXe" className="block text-sm font-medium text-gray-700 mb-2">
                            Biển số xe <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="bienSoXe"
                            name="bienSoXe"
                            value={formData.bienSoXe}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: 30A-12345"
                            required
                            disabled={loading}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50 ${
                                validationErrors.bienSoXe ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {validationErrors.bienSoXe && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.bienSoXe}</p>
                        )}
                    </div>

                    {/* Tên xe */}
                    <div>
                        <label htmlFor="tenXe" className="block text-sm font-medium text-gray-700 mb-2">
                            Tên xe <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="tenXe"
                            name="tenXe"
                            value={formData.tenXe}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: Honda SH 125cc"
                            required
                            disabled={loading}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50 ${
                                validationErrors.tenXe ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {validationErrors.tenXe && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.tenXe}</p>
                        )}
                    </div>

                    {/* Số cavet */}
                    <div>
                        <label htmlFor="soCavet" className="block text-sm font-medium text-gray-700 mb-2">
                            Số cavet
                        </label>
                        <input
                            type="text"
                            id="soCavet"
                            name="soCavet"
                            value={formData.soCavet}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: CV123456789 (tùy chọn)"
                            disabled={loading}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50 ${
                                validationErrors.soCavet ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {validationErrors.soCavet && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.soCavet}</p>
                        )}
                    </div>

                    {/* Loại xe */}
                    <div>
                        <label htmlFor="maLoaiXe" className="block text-sm font-medium text-gray-700 mb-2">
                            Loại xe <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="maLoaiXe"
                            name="maLoaiXe"
                            value={formData.maLoaiXe}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50 ${
                                validationErrors.maLoaiXe ? 'border-red-300' : 'border-gray-300'
                            }`}
                        >
                            <option value="">-- Chọn loại xe --</option>
                            {vehicleTypes.map((type) => (
                                <option key={type.maLoaiXe} value={type.maLoaiXe}>
                                    {type.tenLoaiXe}
                                </option>
                            ))}
                        </select>
                        {validationErrors.maLoaiXe && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.maLoaiXe}</p>
                        )}
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
                                    Đang tạo...
                                </>
                            ) : (
                                'Tạo xe mới'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateVehicleModal;