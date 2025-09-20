import React, { useState } from 'react';

const SmartExtendModal = ({ isOpen, onClose, onSubmit, dangKy, isSubmitting = false }) => {
    const [formData, setFormData] = useState({
        newMonths: 1,
        maNhanVien: 'NV001' // TODO: Lấy từ session/context user đang đăng nhập
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.newMonths || formData.newMonths < 1 || formData.newMonths > 12) {
            alert('Số tháng gia hạn phải từ 1 đến 12');
            return;
        }

        if (!formData.maNhanVien) {
            alert('Vui lòng nhập mã nhân viên');
            return;
        }

        onSubmit(formData);
    };

    const handleClose = () => {
        setFormData({
            newMonths: 1,
            maNhanVien: 'NV001'
        });
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        🔄 Gia hạn thông minh
                    </h2>
                    <button 
                        type="button" 
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {dangKy && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-blue-800 mb-2">Thông tin đăng ký hiện tại:</h3>
                            <div className="text-sm text-blue-700 space-y-1">
                                <p><strong>Biển số:</strong> {dangKy.bienSoXe}</p>
                                <p><strong>Tên xe:</strong> {dangKy.tenXe}</p>
                                <p><strong>Trạng thái:</strong> 
                                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                        dangKy.trangThai === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                        dangKy.trangThai === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {dangKy.trangThai === 'ACTIVE' ? 'Còn hiệu lực' : 
                                         dangKy.trangThai === 'EXPIRED' ? 'Hết hạn' : dangKy.trangThai}
                                    </span>
                                </p>
                                <p><strong>Ngày hết hạn:</strong> {new Date(dangKy.thoiGianHetHan).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-yellow-800">
                                <p className="font-semibold mb-1">Gia hạn thông minh:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Nếu đăng ký <strong>HẾT HẠN</strong>: Tạo gia hạn mới từ hôm nay</li>
                                    <li>Nếu đăng ký <strong>CÒN HIỆU LỰC</strong>: Tạo gia hạn từ ngày hết hạn hiện tại</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số tháng gia hạn <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="newMonths"
                                min="1"
                                max="12"
                                value={formData.newMonths}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-gray-500 mt-1">Chọn từ 1 đến 12 tháng</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mã nhân viên <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="maNhanVien"
                                value={formData.maNhanVien}
                                onChange={handleChange}
                                placeholder="Nhập mã nhân viên (VD: NV001)"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
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
                                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang gia hạn...
                                    </>
                                ) : (
                                    'Gia hạn'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SmartExtendModal;