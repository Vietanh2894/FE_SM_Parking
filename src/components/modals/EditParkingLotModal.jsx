import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditParkingLotModal = ({ isOpen, parkingLot, onSave, onClose, isSubmitting = false }) => {
    const [formData, setFormData] = useState({
        maBaiDo: '',
        tenBaiDo: '',
        soChoTrong: '',
        tongSoCho: '',
        maLoaiXe: '',
        diaChi: '',
        moTa: '',
        trangThai: 'ACTIVE'
    });
    const [vehicleTypes, setVehicleTypes] = useState([]);

    // Initialize form fields when parkingLot changes
    useEffect(() => {
        if (parkingLot) {
            setFormData({
                maBaiDo: parkingLot.maBaiDo || '',
                tenBaiDo: parkingLot.tenBaiDo || '',
                soChoTrong: parkingLot.soChoTrong?.toString() || '',
                tongSoCho: parkingLot.tongSoCho?.toString() || '',
                maLoaiXe: parkingLot.maLoaiXe?.maLoaiXe || '',
                diaChi: parkingLot.diaChi || '',
                moTa: parkingLot.moTa || '',
                trangThai: parkingLot.trangThai || 'ACTIVE'
            });
        }
    }, [parkingLot]);

    // Fetch vehicle types when component mounts
    useEffect(() => {
        if (isOpen) {
            fetchVehicleTypes();
        }
    }, [isOpen]);

    // Don't render if modal is not open or no parkingLot
    if (!isOpen || !parkingLot) {
        return null;
    }

    const fetchVehicleTypes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/vehicle-types', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data && response.data.data) {
                setVehicleTypes(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching vehicle types:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.tenBaiDo || !formData.tongSoCho || !formData.maLoaiXe) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
            return;
        }

        const tongSoChoNum = parseInt(formData.tongSoCho);
        const soChoTrongNum = parseInt(formData.soChoTrong);

        // Validate numbers
        if (tongSoChoNum <= 0) {
            alert('Tổng số chỗ phải lớn hơn 0.');
            return;
        }

        if (soChoTrongNum < 0 || soChoTrongNum > tongSoChoNum) {
            alert('Số chỗ trống phải từ 0 đến tổng số chỗ.');
            return;
        }

        const updatedParkingLotData = {
            ...parkingLot,
            tenBaiDo: formData.tenBaiDo,
            soChoTrong: soChoTrongNum,
            tongSoCho: tongSoChoNum,
            maLoaiXe: { maLoaiXe: formData.maLoaiXe },
            diaChi: formData.diaChi || null,
            moTa: formData.moTa || null,
            trangThai: formData.trangThai
        };

        console.log('Submitting edit parking lot data:', updatedParkingLotData);
        onSave(updatedParkingLotData);
    };

    const handleClose = () => {
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

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
                        ✏️ Sửa bãi đỗ: {parkingLot.maBaiDo}
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Row 1: Mã bãi đỗ và Loại xe */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mã bãi đỗ
                                </label>
                                <input
                                    type="text"
                                    name="maBaiDo"
                                    value={formData.maBaiDo}
                                    placeholder="Mã bãi đỗ"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                    disabled
                                    readOnly
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    🔒 Mã bãi đỗ không thể thay đổi
                                </p>
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
                                    disabled={isSubmitting}
                                >
                                    <option value="">Chọn loại xe</option>
                                    {vehicleTypes.map(vehicleType => (
                                        <option key={vehicleType.maLoaiXe} value={vehicleType.maLoaiXe}>
                                            {vehicleType.tenLoaiXe}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Tên bãi đỗ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên bãi đỗ <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="tenBaiDo"
                                value={formData.tenBaiDo}
                                onChange={handleChange}
                                placeholder="Nhập tên bãi đỗ"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                required
                                maxLength="100"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Row 2: Tổng số chỗ và Số chỗ trống */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tổng số chỗ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="tongSoCho"
                                    value={formData.tongSoCho}
                                    onChange={handleChange}
                                    placeholder="Nhập tổng số chỗ"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                    required
                                    min="1"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số chỗ trống <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="soChoTrong"
                                    value={formData.soChoTrong}
                                    onChange={handleChange}
                                    placeholder="Nhập số chỗ trống"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                    required
                                    min="0"
                                    max={formData.tongSoCho || undefined}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Địa chỉ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Địa chỉ
                            </label>
                            <input
                                type="text"
                                name="diaChi"
                                value={formData.diaChi}
                                onChange={handleChange}
                                placeholder="Nhập địa chỉ bãi đỗ"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                maxLength="255"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Trạng thái */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                name="trangThai"
                                value={formData.trangThai}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                disabled={isSubmitting}
                            >
                                <option value="ACTIVE">🟢 Hoạt động</option>
                                <option value="INACTIVE">🔴 Không hoạt động</option>
                                <option value="MAINTENANCE">🛠️ Bảo trì</option>
                            </select>
                        </div>

                        {/* Mô tả */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả
                            </label>
                            <textarea
                                name="moTa"
                                value={formData.moTa}
                                onChange={handleChange}
                                placeholder="Nhập mô tả về bãi đỗ"
                                rows="3"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                                maxLength="500"
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Tối đa 500 ký tự
                            </p>
                        </div>

                        {/* Thông tin bổ sung */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">📊 Thông tin bổ sung</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Tỷ lệ lấp đầy:</span>
                                    <span className="font-bold text-blue-600">
                                        {formData.tongSoCho ? (((parseInt(formData.tongSoCho) - parseInt(formData.soChoTrong || 0)) / parseInt(formData.tongSoCho)) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                                {parkingLot.createdDate && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Ngày tạo:</span>
                                        <span className="text-gray-800">{new Date(parkingLot.createdDate).toLocaleString('vi-VN')}</span>
                                    </div>
                                )}
                                {parkingLot.updatedDate && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Cập nhật lần cuối:</span>
                                        <span className="text-gray-800">{new Date(parkingLot.updatedDate).toLocaleString('vi-VN')}</span>
                                    </div>
                                )}
                            </div>
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
                            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang cập nhật...
                                </>
                            ) : (
                                'Cập nhật'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditParkingLotModal;
