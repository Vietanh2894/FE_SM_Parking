import React, { useState } from 'react';

const AddParkingModeModal = ({ isOpen, onSave, onClose, isSubmitting = false }) => {
    const [formData, setFormData] = useState({
        maHinhThuc: '',
        tenHinhThuc: ''
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.maHinhThuc.trim()) {
            newErrors.maHinhThuc = 'Mã hình thức là bắt buộc';
        }
        if (!formData.tenHinhThuc.trim()) {
            newErrors.tenHinhThuc = 'Tên hình thức là bắt buộc';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        onSave(formData);
    };

    const handleClose = () => {
        setFormData({
            maHinhThuc: '',
            tenHinhThuc: ''
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="text-3xl">🅿️</span>
                        Thêm hình thức đỗ xe
                    </h2>
                    <p className="text-blue-100 mt-1">Tạo hình thức đỗ xe mới trong hệ thống</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Mã hình thức */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mã hình thức <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="maHinhThuc"
                            value={formData.maHinhThuc}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: HT001"
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-200 ${
                                errors.maHinhThuc 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : 'border-gray-300 focus:border-blue-500'
                            }`}
                            disabled={isSubmitting}
                        />
                        {errors.maHinhThuc && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <span>⚠️</span>
                                {errors.maHinhThuc}
                            </p>
                        )}
                    </div>

                    {/* Tên hình thức */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tên hình thức <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="tenHinhThuc"
                            value={formData.tenHinhThuc}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: Theo giờ"
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-200 ${
                                errors.tenHinhThuc 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : 'border-gray-300 focus:border-blue-500'
                            }`}
                            disabled={isSubmitting}
                        />
                        {errors.tenHinhThuc && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <span>⚠️</span>
                                {errors.tenHinhThuc}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <span>💾</span>
                                    Lưu
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddParkingModeModal;
