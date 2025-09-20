import React, { useState, useEffect } from 'react';

const EditParkingModeModal = ({ isOpen, parkingMode, onSave, onClose, isSubmitting = false }) => {
    const [formData, setFormData] = useState({
        tenHinhThuc: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (parkingMode) {
            setFormData({
                tenHinhThuc: parkingMode.tenHinhThuc || ''
            });
        }
    }, [parkingMode]);

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
        
        if (!formData.tenHinhThuc.trim()) {
            newErrors.tenHinhThuc = 'Tên hình thức là bắt buộc';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const updatedParkingMode = {
            ...parkingMode,
            tenHinhThuc: formData.tenHinhThuc
        };

        onSave(updatedParkingMode);
    };

    const handleClose = () => {
        setFormData({
            tenHinhThuc: ''
        });
        setErrors({});
        onClose();
    };

    if (!isOpen || !parkingMode) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="text-3xl">✏️</span>
                        Chỉnh sửa hình thức đỗ xe
                    </h2>
                    <p className="text-orange-100 mt-1">Cập nhật thông tin hình thức đỗ xe</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Mã hình thức (Read-only) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mã hình thức
                        </label>
                        <input
                            type="text"
                            value={parkingMode.maHinhThuc}
                            readOnly
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                        />
                        <p className="text-gray-500 text-xs mt-1">Mã hình thức không thể thay đổi</p>
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
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${
                                errors.tenHinhThuc 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : 'border-gray-300 focus:border-orange-500'
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
                            className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <span>💾</span>
                                    Cập nhật
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditParkingModeModal;
