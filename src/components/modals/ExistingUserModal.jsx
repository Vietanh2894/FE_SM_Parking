import React, { useState } from 'react';
import dangKyThangService from '../../services/dangKyThangService';

const ExistingUserModal = ({ isOpen, onSave, onClose, isSubmitting = false, vehicleTypes = [] }) => {
    // Ensure vehicleTypes is an array
    const safeVehicleTypes = Array.isArray(vehicleTypes) ? vehicleTypes : [];
    const [step, setStep] = useState(1); // 1: Tìm user, 2: Chọn xe, 3: Điền thông tin
    const [userIdentifier, setUserIdentifier] = useState('');
    const [identifierType, setIdentifierType] = useState('email');
    const [userVehicles, setUserVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isNewVehicle, setIsNewVehicle] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [formData, setFormData] = useState({
        bienSoXe: '',
        tenXe: '',
        maLoaiXe: '',
        soCavet: '',
        soThang: 1,
        maNhanVien: '',
        cccd: '',
        diaChi: '',
        ghiChu: '',
        tuDongNgayBatDau: true,
        ngayBatDau: ''
    });

    // Reset form khi modal đóng/mở
    React.useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setStep(1);
        setUserIdentifier('');
        setIdentifierType('email');
        setUserVehicles([]);
        setSelectedVehicle(null);
        setIsNewVehicle(false);
        setUserInfo(null);
        setFormData({
            bienSoXe: '',
            tenXe: '',
            maLoaiXe: '',
            soCavet: '',
            soThang: 1,
            maNhanVien: '',
            cccd: '',
            diaChi: '',
            ghiChu: '',
            tuDongNgayBatDau: true,
            ngayBatDau: ''
        });
    };

    const handleSearchUser = async () => {
        if (!userIdentifier.trim()) {
            alert('Vui lòng nhập email hoặc số điện thoại');
            return;
        }

        try {
            console.log('🔍 Searching user vehicles:', userIdentifier, identifierType);
            
            // Call API để tìm xe của user
            const result = await dangKyThangService.getUserVehicles(userIdentifier, identifierType);
            console.log('🔍 API Result:', result);
            
            if (result.success && result.data && result.data.length > 0) {
                setUserVehicles(result.data);
                setStep(2);
            } else {
                alert(result.message || 'Không tìm thấy khách hàng hoặc khách hàng chưa có xe nào');
            }
        } catch (error) {
            console.error('Error searching user vehicles:', error);
            alert('Có lỗi xảy ra khi tìm kiếm khách hàng');
        }
    };

    const handleVehicleSelection = () => {
        if (isNewVehicle) {
            // Chuyển sang bước điền thông tin xe mới
            setStep(3);
        } else if (selectedVehicle) {
            // Sử dụng xe có sẵn
            setFormData(prev => ({
                ...prev,
                bienSoXe: selectedVehicle.bienSoXe,
                tenXe: selectedVehicle.tenXe,
                maLoaiXe: selectedVehicle.maLoaiXe?.maLoaiXe || '',
                soCavet: selectedVehicle.soCavet || ''
            }));
            setStep(3);
        } else {
            alert('Vui lòng chọn xe hoặc chọn "Thêm xe mới"');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.bienSoXe || !formData.tenXe || !formData.maLoaiXe || !formData.soThang || 
            !formData.maNhanVien || !formData.cccd || !formData.diaChi) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc (bao gồm CCCD và địa chỉ)');
            return;
        }

        // Validate custom start date
        if (!formData.tuDongNgayBatDau && !formData.ngayBatDau) {
            alert('Vui lòng chọn ngày bắt đầu');
            return;
        }

        // Chuẩn bị data để gửi theo đúng format API
        const submissionData = {
            userIdentifier,
            identifierType,
            registrationData: {
                bienSoXe: formData.bienSoXe.trim(),
                tenXe: formData.tenXe.trim(),
                maLoaiXe: formData.maLoaiXe,
                soThang: parseInt(formData.soThang),
                maNhanVien: formData.maNhanVien.trim(),
                cccd: formData.cccd.trim(), // Required field
                soCavet: formData.soCavet.trim() || '', // Optional
                diaChi: formData.diaChi.trim(), // Required field
                ghiChu: formData.ghiChu || '',
                // Date handling fields
                tuDongNgayBatDau: formData.tuDongNgayBatDau,
                ...(formData.tuDongNgayBatDau ? {} : { ngayBatDau: formData.ngayBatDau })
            }
        };

        console.log('� ExistingUserModal - submitting data with date options:', {
            tuDongNgayBatDau: submissionData.registrationData.tuDongNgayBatDau,
            ngayBatDau: submissionData.registrationData.ngayBatDau,
            fullData: submissionData
        });
        onSave(submissionData);
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

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        👤 Đăng ký cho khách hàng cũ
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

                {/* Content */}
                <div className="p-6">
                    {/* Step 1: Tìm khách hàng */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Bước 1: Tìm khách hàng</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Loại thông tin
                                </label>
                                <select
                                    value={identifierType}
                                    onChange={(e) => setIdentifierType(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                >
                                    <option value="email">Email</option>
                                    <option value="sdt">Số điện thoại</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {identifierType === 'email' ? 'Email khách hàng' : 'Số điện thoại'}
                                </label>
                                <input
                                    type={identifierType === 'email' ? 'email' : 'text'}
                                    value={userIdentifier}
                                    onChange={(e) => setUserIdentifier(e.target.value)}
                                    placeholder={identifierType === 'email' ? 'Nhập email khách hàng' : 'Nhập số điện thoại'}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleSearchUser}
                                disabled={isSubmitting}
                                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                            >
                                {isSubmitting ? 'Đang tìm...' : 'Tìm khách hàng'}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Chọn xe */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Bước 2: Chọn phương tiện</h3>
                            
                            <div className="space-y-3">
                                {userVehicles.map((vehicle, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                                            selectedVehicle === vehicle ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => {
                                            setSelectedVehicle(vehicle);
                                            setIsNewVehicle(false);
                                        }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-900">{vehicle.bienSoXe}</p>
                                                <p className="text-gray-600">{vehicle.tenXe}</p>
                                                <p className="text-sm text-gray-500">{vehicle.maLoaiXe?.tenLoaiXe}</p>
                                            </div>
                                            <input
                                                type="radio"
                                                checked={selectedVehicle === vehicle}
                                                onChange={() => {}}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                ))}

                                <div
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                                        isNewVehicle ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => {
                                        setIsNewVehicle(true);
                                        setSelectedVehicle(null);
                                    }}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-green-700">➕ Thêm xe mới</p>
                                            <p className="text-sm text-gray-500">Đăng ký với xe chưa có trong hệ thống</p>
                                        </div>
                                        <input
                                            type="radio"
                                            checked={isNewVehicle}
                                            onChange={() => {}}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Quay lại
                                </button>
                                <button
                                    type="button"
                                    onClick={handleVehicleSelection}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Tiếp tục
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Điền thông tin đăng ký */}
                    {step === 3 && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Bước 3: Thông tin đăng ký</h3>
                            
                            {isNewVehicle && (
                                <>
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
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                            required
                                            disabled={isSubmitting}
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
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số cavet
                                        </label>
                                        <input
                                            type="text"
                                            name="soCavet"
                                            value={formData.soCavet}
                                            onChange={handleChange}
                                            placeholder="Nhập số cavet"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                            disabled={isSubmitting}
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
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                            required
                                            disabled={isSubmitting}
                                        >
                                            <option value="">-- Chọn loại xe --</option>
                                            {safeVehicleTypes.map((vehicleType) => (
                                                <option key={vehicleType.maLoaiXe} value={vehicleType.maLoaiXe}>
                                                    {vehicleType.tenLoaiXe}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {!isNewVehicle && selectedVehicle && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-700 mb-2">Xe đã chọn:</h4>
                                    <p><strong>Biển số:</strong> {selectedVehicle.bienSoXe}</p>
                                    <p><strong>Tên xe:</strong> {selectedVehicle.tenXe}</p>
                                    <p><strong>Loại xe:</strong> {selectedVehicle.maLoaiXe?.tenLoaiXe}</p>
                                </div>
                            )}

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
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Date Selection Section */}
                            <div>
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
                                                disabled={isSubmitting}
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
                                                disabled={isSubmitting}
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
                                            disabled={isSubmitting}
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
                                    placeholder="Nhập mã nhân viên"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Thông tin khách hàng - bắt buộc */}
                            <div className="border-t pt-4">
                                <h4 className="text-md font-semibold text-gray-700 mb-3">Thông tin khách hàng</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            CCCD/CMND <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="cccd"
                                            value={formData.cccd}
                                            onChange={handleChange}
                                            placeholder="Nhập số CCCD/CMND"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Địa chỉ <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="diaChi"
                                            value={formData.diaChi}
                                            onChange={handleChange}
                                            placeholder="Nhập địa chỉ đầy đủ"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ghi chú
                                </label>
                                <textarea
                                    name="ghiChu"
                                    value={formData.ghiChu}
                                    onChange={handleChange}
                                    placeholder="Nhập ghi chú (tùy chọn)"
                                    rows="3"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Quay lại
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
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
                                        'Tạo đăng ký'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExistingUserModal;