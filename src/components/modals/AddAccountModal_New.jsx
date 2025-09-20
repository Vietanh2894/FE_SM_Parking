import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddAccountModal = ({ isOpen, onClose, onAccountAdded }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        roleId: '',
        trangThai: 'ENABLE'
    });
    
    const [roles, setRoles] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchRoles();
            // Reset form when modal opens
            setFormData({
                username: '',
                password: '',
                confirmPassword: '',
                roleId: '',
                trangThai: 'ENABLE'
            });
            setErrors({});
        }
    }, [isOpen]);

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
        if (!formData.username.trim()) {
            newErrors.username = 'Tên đăng nhập là bắt buộc';
        } else if (formData.username.trim().length < 3) {
            newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.trim().length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        if (!formData.roleId) {
            newErrors.roleId = 'Vai trò là bắt buộc';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');
            const accountData = {
                username: formData.username,
                password: formData.password,
                trangThai: formData.trangThai,
                role: {
                    roleId: formData.roleId
                }
            };

            const response = await axios.post('http://localhost:8080/accounts', accountData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status >= 200 && response.status < 300) {
                onAccountAdded();
                handleClose();
            }
        } catch (error) {
            console.error('Error adding account:', error);
            if (error.response?.data?.message) {
                setErrors({ submit: error.response.data.message });
            } else {
                setErrors({ submit: 'Không thể thêm tài khoản. Vui lòng thử lại.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            username: '',
            password: '',
            confirmPassword: '',
            roleId: '',
            trangThai: 'ENABLE'
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="text-3xl">➕</span>
                        Thêm tài khoản mới
                    </h2>
                    <p className="text-green-100 mt-1">Tạo tài khoản mới cho hệ thống</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span>❌</span>
                                <span>{errors.submit}</span>
                            </div>
                        </div>
                    )}

                    {/* Username */}
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

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mật khẩu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Tối thiểu 6 ký tự"
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                                errors.password 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : 'border-gray-300 focus:border-green-500'
                            }`}
                            disabled={isSubmitting}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <span>⚠️</span>
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Xác nhận mật khẩu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Nhập lại mật khẩu"
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                                errors.confirmPassword 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : 'border-gray-300 focus:border-green-500'
                            }`}
                            disabled={isSubmitting}
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <span>⚠️</span>
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Vai trò <span className="text-red-500">*</span>
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
                            <option value="">Chọn vai trò</option>
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

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Trạng thái
                        </label>
                        <select
                            name="trangThai"
                            value={formData.trangThai}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                            disabled={isSubmitting}
                        >
                            <option value="ENABLE">Hoạt động</option>
                            <option value="DISABLE">Khóa</option>
                        </select>
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
                                    Đang thêm...
                                </>
                            ) : (
                                <>
                                    <span>💾</span>
                                    Thêm tài khoản
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAccountModal;
