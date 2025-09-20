import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditAccountModal = ({ isOpen, onClose, onAccountUpdated, account }) => {
    const [formData, setFormData] = useState({
        username: '',
        roleId: '',
        trangThai: 'ENABLE',
        newPassword: '',
        confirmNewPassword: ''
    });
    
    const [roles, setRoles] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchRoles();
            if (account) {
                // Populate form with account data
                setFormData({
                    username: account.username || '',
                    roleId: account.role?.roleId || '',
                    trangThai: account.trangThai || 'ENABLE',
                    newPassword: '',
                    confirmNewPassword: ''
                });
            } else {
                // Reset form when no account provided
                setFormData({
                    username: '',
                    roleId: '',
                    trangThai: 'ENABLE',
                    newPassword: '',
                    confirmNewPassword: ''
                });
            }
            setErrors({});
            setShowPasswordChange(false);
        }
    }, [isOpen, account]);

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
        }

        if (!formData.roleId) {
            newErrors.roleId = 'Vai trò là bắt buộc';
        }

        // Password validation only if changing password
        if (showPasswordChange) {
            if (!formData.newPassword.trim()) {
                newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
            } else if (formData.newPassword.trim().length < 6) {
                newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
            }

            if (!formData.confirmNewPassword.trim()) {
                newErrors.confirmNewPassword = 'Xác nhận mật khẩu mới là bắt buộc';
            } else if (formData.newPassword !== formData.confirmNewPassword) {
                newErrors.confirmNewPassword = 'Mật khẩu xác nhận không khớp';
            }
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
                username: account.username, // Cần username để backend biết update account nào
                trangThai: formData.trangThai,
                role: {
                    roleId: formData.roleId
                }
            };

            // Xử lý password: 
            // - Nếu thay đổi password: gửi password mới
            // - Nếu không thay đổi: gửi password cũ (đã hash) để backend không hash lại
            if (showPasswordChange && formData.newPassword.trim()) {
                accountData.password = formData.newPassword.trim();
                console.log('Updating account with new password:', account.username);
            } else {
                // Gửi password cũ để backend không hash lại
                accountData.password = account.password;
                console.log('Updating account keeping old password:', account.username);
            }

            console.log('Request data:', accountData);

            const response = await axios.put(`http://localhost:8080/accounts`, accountData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Update response:', response);

            if (response.status >= 200 && response.status < 300) {
                onAccountUpdated();
                handleClose();
            }
        } catch (error) {
            console.error('Error updating account:', error);
            console.error('Error details:', error.response?.data);
            if (error.response?.data?.message) {
                setErrors({ submit: error.response.data.message });
            } else if (error.response?.status === 404) {
                setErrors({ submit: 'Tài khoản không tồn tại hoặc đã bị xóa.' });
            } else if (error.response?.status === 400) {
                setErrors({ submit: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.' });
            } else {
                setErrors({ submit: 'Không thể cập nhật tài khoản. Vui lòng thử lại.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            username: '',
            roleId: '',
            trangThai: 'ENABLE',
            newPassword: '',
            confirmNewPassword: ''
        });
        setErrors({});
        setShowPasswordChange(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="text-3xl">✏️</span>
                        Chỉnh sửa tài khoản
                    </h2>
                    <p className="text-blue-100 mt-1">Cập nhật thông tin tài khoản</p>
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

                    {/* Username (readonly for edit) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            readOnly
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Tên đăng nhập không thể thay đổi</p>
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
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-200 ${
                                errors.roleId 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : 'border-gray-300 focus:border-blue-500'
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
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                            disabled={isSubmitting}
                        >
                            <option value="ENABLE">Hoạt động</option>
                            <option value="DISABLE">Khóa</option>
                        </select>
                    </div>

                    {/* Password Change Toggle */}
                    <div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="changePassword"
                                checked={showPasswordChange}
                                onChange={(e) => {
                                    setShowPasswordChange(e.target.checked);
                                    if (!e.target.checked) {
                                        setFormData(prev => ({
                                            ...prev,
                                            newPassword: '',
                                            confirmNewPassword: ''
                                        }));
                                        setErrors(prev => {
                                            const { newPassword, confirmNewPassword, ...rest } = prev;
                                            return rest;
                                        });
                                    }
                                }}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                disabled={isSubmitting}
                            />
                            <label htmlFor="changePassword" className="text-sm font-medium text-gray-700">
                                Thay đổi mật khẩu
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {showPasswordChange 
                                ? "✏️ Mật khẩu sẽ được cập nhật với giá trị mới" 
                                : "🔒 Mật khẩu hiện tại sẽ được giữ nguyên"
                            }
                        </p>
                    </div>

                    {/* Password Fields (conditional) */}
                    {showPasswordChange && (
                        <>
                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mật khẩu mới <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    placeholder="Tối thiểu 6 ký tự"
                                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-200 ${
                                        errors.newPassword 
                                            ? 'border-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                    disabled={isSubmitting}
                                />
                                {errors.newPassword && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <span>⚠️</span>
                                        {errors.newPassword}
                                    </p>
                                )}
                            </div>

                            {/* Confirm New Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="confirmNewPassword"
                                    value={formData.confirmNewPassword}
                                    onChange={handleInputChange}
                                    placeholder="Nhập lại mật khẩu mới"
                                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-200 ${
                                        errors.confirmNewPassword 
                                            ? 'border-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                    disabled={isSubmitting}
                                />
                                {errors.confirmNewPassword && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <span>⚠️</span>
                                        {errors.confirmNewPassword}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

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
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
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

export default EditAccountModal;
