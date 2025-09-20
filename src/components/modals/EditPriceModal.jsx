import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditPriceModal = ({ isOpen, price, onSave, onClose, isSubmitting = false }) => {
    const [formData, setFormData] = useState({
        maBangGia: '',
        maLoaiXe: '',
        maHinhThuc: '',
        gia: ''
    });
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [parkingModes, setParkingModes] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Initialize form fields when price changes
    useEffect(() => {
        if (price) {
            setFormData({
                maBangGia: price.maBangGia || '',
                maLoaiXe: price.maLoaiXe?.maLoaiXe || '',
                maHinhThuc: price.maHinhThuc?.maHinhThuc || '',
                gia: price.gia?.toString() || ''
            });
        }
    }, [price]);

    // Fetch vehicle types and parking modes when component mounts
    useEffect(() => {
        if (isOpen) {
            fetchVehicleTypes();
            fetchParkingModes();
        }
    }, [isOpen]);

    const fetchVehicleTypes = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/vehicle-types', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data && response.data.data) {
                setVehicleTypes(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching vehicle types:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchParkingModes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/parking-modes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data && response.data.data) {
                setParkingModes(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching parking modes:', error);
        }
    };

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
        
        if (!formData.maLoaiXe) {
            newErrors.maLoaiXe = 'Vui lòng chọn loại xe';
        }
        if (!formData.maHinhThuc) {
            newErrors.maHinhThuc = 'Vui lòng chọn hình thức đỗ xe';
        }
        if (!formData.gia) {
            newErrors.gia = 'Giá là bắt buộc';
        } else if (parseFloat(formData.gia) < 0) {
            newErrors.gia = 'Giá phải lớn hơn hoặc bằng 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const updatedPrice = {
            maBangGia: formData.maBangGia,
            maLoaiXe: { maLoaiXe: formData.maLoaiXe },
            maHinhThuc: { maHinhThuc: formData.maHinhThuc },
            gia: parseFloat(formData.gia)
        };

        onSave(updatedPrice);
    };

    const handleClose = () => {
        setFormData({
            maBangGia: '',
            maLoaiXe: '',
            maHinhThuc: '',
            gia: ''
        });
        setErrors({});
        onClose();
    };

    if (!isOpen || !price) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="text-3xl">✏️</span>
                        Chỉnh sửa bảng giá
                    </h2>
                    <p className="text-orange-100 mt-1">Cập nhật thông tin bảng giá</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Mã bảng giá (Read-only) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mã bảng giá
                        </label>
                        <input
                            type="text"
                            name="maBangGia"
                            value={formData.maBangGia}
                            readOnly
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                        />
                        <p className="text-gray-500 text-xs mt-1">Mã bảng giá không thể thay đổi</p>
                    </div>

                    {/* Loại xe */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Loại xe <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="maLoaiXe"
                            value={formData.maLoaiXe}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${
                                errors.maLoaiXe 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : 'border-gray-300 focus:border-orange-500'
                            }`}
                            disabled={isSubmitting || isLoading}
                        >
                            <option value="">Chọn loại xe</option>
                            {vehicleTypes.map(vehicleType => (
                                <option key={vehicleType.maLoaiXe} value={vehicleType.maLoaiXe}>
                                    {vehicleType.tenLoaiXe}
                                </option>
                            ))}
                        </select>
                        {errors.maLoaiXe && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <span>⚠️</span>
                                {errors.maLoaiXe}
                            </p>
                        )}
                    </div>

                    {/* Hình thức đỗ xe */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Hình thức đỗ xe <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="maHinhThuc"
                            value={formData.maHinhThuc}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${
                                errors.maHinhThuc 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : 'border-gray-300 focus:border-orange-500'
                            }`}
                            disabled={isSubmitting || isLoading}
                        >
                            <option value="">Chọn hình thức đỗ xe</option>
                            {parkingModes.map(parkingMode => (
                                <option key={parkingMode.maHinhThuc} value={parkingMode.maHinhThuc}>
                                    {parkingMode.tenHinhThuc}
                                </option>
                            ))}
                        </select>
                        {errors.maHinhThuc && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <span>⚠️</span>
                                {errors.maHinhThuc}
                            </p>
                        )}
                    </div>

                    {/* Giá */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Giá (VND) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="gia"
                            value={formData.gia}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: 15000"
                            min="0"
                            step="1000"
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${
                                errors.gia 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : 'border-gray-300 focus:border-orange-500'
                            }`}
                            disabled={isSubmitting}
                        />
                        {errors.gia && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <span>⚠️</span>
                                {errors.gia}
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
                            disabled={isSubmitting || isLoading}
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

export default EditPriceModal;
