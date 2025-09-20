import React, { useState, useEffect } from 'react';

const AddVehicleModal = ({ isOpen, onSave, onClose, isSubmitting = false }) => {
    const [formData, setFormData] = useState({
        bienSoXe: '',
        tenXe: '',
        soCavet: '',
        maLoaiXe: '',
        ownerId: ''
    });

    // Reset form when modal is closed/opened
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    // Reset form when modal is closed
    const resetForm = () => {
        setFormData({
            bienSoXe: '',
            tenXe: '',
            soCavet: '',
            maLoaiXe: '',
            ownerId: ''
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.bienSoXe || !formData.tenXe || !formData.soCavet || !formData.maLoaiXe || !formData.ownerId) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        const newVehicleData = {
            bienSoXe: formData.bienSoXe,
            tenXe: formData.tenXe,
            soCavet: formData.soCavet,
            maLoaiXe: {
                maLoaiXe: formData.maLoaiXe
            },
            owner: { id: parseInt(formData.ownerId, 10) }
        };

        console.log('Submitting vehicle data:', newVehicleData);
        onSave(newVehicleData);
        // Don't reset form here - let parent handle success/failure
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    // Don't render if modal is not open
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        🚗 Thêm phương tiện mới
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Biển số xe <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="bienSoXe"
                                value={formData.bienSoXe}
                                onChange={handleChange}
                                placeholder="Nhập biển số xe (VD: 30A-123.45)"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên xe <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="tenXe"
                                value={formData.tenXe}
                                onChange={handleChange}
                                placeholder="Nhập tên xe (VD: Honda Vision)"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số Cavet <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="soCavet"
                                value={formData.soCavet}
                                onChange={handleChange}
                                placeholder="Nhập số Cavet (VD: CAVET123456)"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mã loại xe <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="maLoaiXe"
                                value={formData.maLoaiXe}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                            >
                                <option value="">Chọn loại xe</option>
                                <option value="LX001">🏍️ Xe máy (LX001)</option>
                                <option value="LX002">🚗 Xe ô tô (LX002)</option>
                                <option value="LX003">🚲 Xe đạp (LX003)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Chọn loại phương tiện phù hợp
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ID Chủ sở hữu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="ownerId"
                                value={formData.ownerId}
                                onChange={handleChange}
                                placeholder="Nhập ID chủ sở hữu"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                                min="1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                ID của người dùng sở hữu phương tiện này
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button 
                            type="button" 
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang lưu...
                                </>
                            ) : (
                                'Lưu'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVehicleModal;

