import React, { useState, useEffect } from 'react';

const AddDangKyThangModal = ({ isOpen, onSave, onClose, isSubmitting = false, vehicleTypes = [] }) => {
    // Ensure vehicleTypes is an array
    const safeVehicleTypes = Array.isArray(vehicleTypes) ? vehicleTypes : [];
    
    // Debug logs
    console.log('🏎️ AddDangKyThangModal - vehicleTypes prop:', vehicleTypes);
    console.log('🏎️ AddDangKyThangModal - safeVehicleTypes:', safeVehicleTypes);
    console.log('🏎️ AddDangKyThangModal - safeVehicleTypes length:', safeVehicleTypes.length);
    console.log('🏎️ AddDangKyThangModal - first item structure:', safeVehicleTypes[0]);
    const [formData, setFormData] = useState({
        bienSoXe: '',
        tenXe: '',
        maLoaiXe: '',
        maNhanVien: '',
        soThang: 1,
        cccd: '',
        soCavet: '',
        diaChi: '',
        email: '',
        soDienThoai: '',
        password: '',
        ghiChu: '',
        tuDongNgayBatDau: true,
        ngayBatDau: ''
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
            maLoaiXe: '',
            maNhanVien: '',
            soThang: 1,
            cccd: '',
            soCavet: '',
            diaChi: '',
            email: '',
            soDienThoai: '',
            password: '',
            ghiChu: '',
            tuDongNgayBatDau: true,
            ngayBatDau: ''
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.bienSoXe || !formData.tenXe || !formData.maLoaiXe || !formData.maNhanVien ||
            !formData.cccd || !formData.soCavet || !formData.diaChi || 
            !formData.email || !formData.soDienThoai || !formData.password) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        // Validate custom start date
        if (!formData.tuDongNgayBatDau && !formData.ngayBatDau) {
            alert('Vui lòng chọn ngày bắt đầu');
            return;
        }

        // Prepare data for API
        const dangKyThangData = {
            bienSoXe: formData.bienSoXe.trim(),
            tenXe: formData.tenXe.trim(),
            maLoaiXe: formData.maLoaiXe,
            maNhanVien: formData.maNhanVien.trim(),
            soThang: parseInt(formData.soThang),
            cccd: formData.cccd.trim(),
            soCavet: formData.soCavet.trim(),
            diaChi: formData.diaChi.trim(),
            email: formData.email.trim(),
            soDienThoai: formData.soDienThoai.trim(),
            password: formData.password,
            ghiChu: formData.ghiChu || '',
            // Date handling fields
            tuDongNgayBatDau: formData.tuDongNgayBatDau,
            ...(formData.tuDongNgayBatDau ? {} : { ngayBatDau: formData.ngayBatDau }),
            // Trạng thái mặc định cho đăng ký mới
            trangThaiThanhToan: 'PENDING',
            trangThai: 'PENDING'
        };

        console.log('📅 AddDangKyThangModal - submitting data with date options:', {
            tuDongNgayBatDau: dangKyThangData.tuDongNgayBatDau,
            ngayBatDau: dangKyThangData.ngayBatDau,
            fullData: dangKyThangData
        });
        onSave(dangKyThangData);
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
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        📝 Thêm đăng ký tháng mới
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Biển số xe <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="bienSoXe"
                                value={formData.bienSoXe}
                                onChange={handleChange}
                                placeholder="Nhập biển số xe"
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
                                placeholder="Nhập tên xe"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loại xe <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="maLoaiXe"
                                value={formData.maLoaiXe}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                            >
                                <option value="">-- Chọn loại xe --</option>
                                {safeVehicleTypes.map((type, index) => (
                                    <option 
                                        key={`vehicle-type-${type?.maLoaiXe || index}`} 
                                        value={type?.maLoaiXe || ''}
                                    >
                                        {type?.tenLoaiXe || 'Unknown Vehicle Type'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số tháng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="soThang"
                                min="1"
                                max="12"
                                value={formData.soThang}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                            />
                        </div>

                        {/* Date Selection Section */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Ngày bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="tuDongNgayBatDau"
                                            checked={formData.tuDongNgayBatDau}
                                            onChange={() => setFormData(prev => ({ ...prev, tuDongNgayBatDau: true, ngayBatDau: '' }))}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Dùng ngày hiện tại</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="tuDongNgayBatDau"
                                            checked={!formData.tuDongNgayBatDau}
                                            onChange={() => setFormData(prev => ({ ...prev, tuDongNgayBatDau: false }))}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Chọn ngày bắt đầu</span>
                                    </label>
                                </div>
                                {!formData.tuDongNgayBatDau && (
                                    <input
                                        type="date"
                                        name="ngayBatDau"
                                        value={formData.ngayBatDau}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                        required={!formData.tuDongNgayBatDau}
                                    />
                                )}
                            </div>
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
                                placeholder="Nhập mã nhân viên (vd: NV001)"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CCCD <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="cccd"
                                value={formData.cccd}
                                onChange={handleChange}
                                placeholder="Nhập số CCCD/CMND"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số cavet <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="soCavet"
                                value={formData.soCavet}
                                onChange={handleChange}
                                placeholder="Nhập số cavet"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Địa chỉ <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="diaChi"
                                value={formData.diaChi}
                                onChange={handleChange}
                                placeholder="Nhập địa chỉ"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Nhập địa chỉ email"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số điện thoại <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="soDienThoai"
                                value={formData.soDienThoai}
                                onChange={handleChange}
                                placeholder="Nhập số điện thoại"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ghi chú
                            </label>
                            <textarea
                                name="ghiChu"
                                value={formData.ghiChu}
                                onChange={handleChange}
                                placeholder="Nhập ghi chú (nếu có)"
                                rows="3"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                            />
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

export default AddDangKyThangModal;
