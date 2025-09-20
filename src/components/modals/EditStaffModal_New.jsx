import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditStaffModal = ({ isOpen, onSave, onClose, staff, isSubmitting = false }) => {
    const [formData, setFormData] = useState({
        maNV: '',
        hoTen: '',
        sdt: '',
        email: '',
        cccd: '',
        chucVu: '',
        ngayVaoLam: '',
        username: '',
        roleId: ''
    });
    
    const [roles, setRoles] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchRoles();
            if (staff) {
                // Populate form with staff data
                setFormData({
                    maNV: staff.maNV || '',
                    hoTen: staff.hoTen || '',
                    sdt: staff.sdt || '',
                    email: staff.email || '',
                    cccd: staff.cccd || '',
                    chucVu: staff.chucVu || '',
                    ngayVaoLam: staff.ngayVaoLam || '',
                    username: staff.account?.username || '',
                    roleId: staff.account?.role?.roleId || ''
                });
            } else {
                // Reset form when no staff provided
                setFormData({
                    maNV: '',
                    hoTen: '',
                    sdt: '',
                    email: '',
                    cccd: '',
                    chucVu: '',
                    ngayVaoLam: '',
                    username: '',
                    roleId: ''
                });
            }
            setErrors({});
        }
    }, [isOpen, staff]);

    const fetchRoles = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/roles', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data && response.data.data) {
                setRoles(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        if (!formData.maNV.trim()) {
            newErrors.maNV = 'Mã nhân viên là bắt buộc';
        }

        if (!formData.hoTen.trim()) {
            newErrors.hoTen = 'Họ tên là bắt buộc';
        } else if (formData.hoTen.trim().length < 2) {
            newErrors.hoTen = 'Họ tên phải có ít nhất 2 ký tự';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không đúng định dạng';
        }

        if (!formData.sdt.trim()) {
            newErrors.sdt = 'Số điện thoại là bắt buộc';
        } else if (!/^[0-9]{10,11}$/.test(formData.sdt)) {
            newErrors.sdt = 'Số điện thoại phải có 10-11 chữ số';
        }

        if (!formData.cccd.trim()) {
            newErrors.cccd = 'CCCD là bắt buộc';
        } else if (!/^[0-9]{12}$/.test(formData.cccd)) {
            newErrors.cccd = 'CCCD phải có 12 chữ số';
        }

        if (!formData.chucVu) {
            newErrors.chucVu = 'Chức vụ là bắt buộc';
        }

        if (!formData.ngayVaoLam) {
            newErrors.ngayVaoLam = 'Ngày vào làm là bắt buộc';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Tên đăng nhập là bắt buộc';
        } else if (formData.username.trim().length < 3) {
            newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
        }

        if (!formData.roleId) {
            newErrors.roleId = 'Role là bắt buộc';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const staffData = {
            maNV: formData.maNV,
            hoTen: formData.hoTen,
            sdt: formData.sdt,
            email: formData.email,
            cccd: formData.cccd,
            chucVu: formData.chucVu,
            ngayVaoLam: formData.ngayVaoLam,
            account: {
                username: formData.username,
                trangThai: 'ENABLE',
                role: {
                    roleId: formData.roleId
                }
            }
        };

        onSave(staffData);
    };

    const handleClose = () => {
        setFormData({
            maNV: '',
            hoTen: '',
            sdt: '',
            email: '',
            cccd: '',
            chucVu: '',
            ngayVaoLam: '',
            username: '',
            roleId: ''
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="text-3xl">✏️</span>
                        Chỉnh sửa nhân viên
                    </h2>
                    <p className="text-green-100 mt-1">Cập nhật thông tin nhân viên trong hệ thống</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mã nhân viên */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mã nhân viên <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="maNV"
                                value={formData.maNV}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: NV001"
                                className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                                    errors.maNV 
                                        ? 'border-red-500 focus:border-red-500' 
                                        : 'border-gray-300 focus:border-green-500'
                                }`}
                                disabled={isSubmitting}
                            />
                            {errors.maNV && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <span>⚠️</span>
                                    {errors.maNV}
                                </p>
                            )}
                        </div>

                        {/* Họ tên */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Họ tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="hoTen"
                                value={formData.hoTen}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: Nguyễn Văn A"
                                className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                                    errors.hoTen 
                                        ? 'border-red-500 focus:border-red-500' 
                                        : 'border-gray-300 focus:border-green-500'
                                }`}
                                disabled={isSubmitting}
                            />
                            {errors.hoTen && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <span>⚠️</span>
                                    {errors.hoTen}
                                </p>
                            )}
                        </div>

                        {/* Số điện thoại */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Số điện thoại <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="sdt"
                                value={formData.sdt}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: 0901234567"
                                className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                                    errors.sdt 
                                        ? 'border-red-500 focus:border-red-500' 
                                        : 'border-gray-300 focus:border-green-500'
                                }`}
                                disabled={isSubmitting}
                            />
                            {errors.sdt && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <span>⚠️</span>
                                    {errors.sdt}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: example@gmail.com"
                                className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                                    errors.email 
                                        ? 'border-red-500 focus:border-red-500' 
                                        : 'border-gray-300 focus:border-green-500'
                                }`}
                                disabled={isSubmitting}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <span>⚠️</span>
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* CCCD */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                CCCD <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="cccd"
                                value={formData.cccd}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: 123456789012"
                                className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                                    errors.cccd 
                                        ? 'border-red-500 focus:border-red-500' 
                                        : 'border-gray-300 focus:border-green-500'
                                }`}
                                disabled={isSubmitting}
                            />
                            {errors.cccd && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <span>⚠️</span>
                                    {errors.cccd}
                                </p>
                            )}
                        </div>

                        {/* Chức vụ */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Chức vụ <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="chucVu"
                                value={formData.chucVu}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                                    errors.chucVu 
                                        ? 'border-red-500 focus:border-red-500' 
                                        : 'border-gray-300 focus:border-green-500'
                                }`}
                                disabled={isSubmitting}
                            >
                                <option value="">Chọn chức vụ</option>
                                <option value="ADMIN">Quản trị viên</option>
                                <option value="BAO_VE">Bảo vệ</option>
                            </select>
                            {errors.chucVu && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <span>⚠️</span>
                                    {errors.chucVu}
                                </p>
                            )}
                        </div>

                        {/* Ngày vào làm */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Ngày vào làm <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="ngayVaoLam"
                                value={formData.ngayVaoLam}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                                    errors.ngayVaoLam 
                                        ? 'border-red-500 focus:border-red-500' 
                                        : 'border-gray-300 focus:border-green-500'
                                }`}
                                disabled={isSubmitting}
                            />
                            {errors.ngayVaoLam && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <span>⚠️</span>
                                    {errors.ngayVaoLam}
                                </p>
                            )}
                        </div>

                        {/* Tên đăng nhập */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tên đăng nhập <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: admin001"
                                className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                                    errors.username 
                                        ? 'border-red-500 focus:border-red-500' 
                                        : 'border-gray-300 focus:border-green-500'
                                }`}
                                disabled={isSubmitting}
                            />
                            {errors.username && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <span>⚠️</span>
                                    {errors.username}
                                </p>
                            )}
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="roleId"
                                value={formData.roleId}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                                    errors.roleId 
                                        ? 'border-red-500 focus:border-red-500' 
                                        : 'border-gray-300 focus:border-green-500'
                                }`}
                                disabled={isSubmitting || isLoading}
                            >
                                <option value="">Chọn role</option>
                                {roles.map(role => (
                                    <option key={role.roleId} value={role.roleId}>
                                        {role.roleName}
                                    </option>
                                ))}
                            </select>
                            {errors.roleId && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <span>⚠️</span>
                                    {errors.roleId}
                                </p>
                            )}
                        </div>
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
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <span>🔄</span>
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

export default EditStaffModal;
