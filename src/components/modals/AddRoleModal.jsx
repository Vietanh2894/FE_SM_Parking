import React, { useState } from 'react';
import axios from 'axios';

const AddRoleModal = ({ isOpen, onClose, onRoleAdded }) => {
    const [formData, setFormData] = useState({
        roleId: '',
        roleName: ''
    });
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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

        if (!formData.roleId.trim()) {
            newErrors.roleId = 'Role ID là bắt buộc';
        } else if (formData.roleId.trim().length < 2) {
            newErrors.roleId = 'Role ID phải có ít nhất 2 ký tự';
        }

        if (!formData.roleName.trim()) {
            newErrors.roleName = 'Tên role là bắt buộc';
        } else if (formData.roleName.trim().length < 2) {
            newErrors.roleName = 'Tên role phải có ít nhất 2 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const roleData = {
                roleId: formData.roleId.trim(),
                roleName: formData.roleName.trim()
            };

            console.log('Adding role:', roleData);

            const response = await axios.post('http://localhost:8080/roles', roleData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Add response:', response);

            if (response.status >= 200 && response.status < 300) {
                onRoleAdded();
                handleClose();
            }
        } catch (error) {
            console.error('Error adding role:', error);
            console.error('Error details:', error.response?.data);
            
            if (error.response?.data?.message) {
                setErrors({ submit: error.response.data.message });
            } else if (error.response?.status === 409) {
                setErrors({ submit: 'Role ID đã tồn tại. Vui lòng chọn ID khác.' });
            } else if (error.response?.status === 400) {
                setErrors({ submit: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.' });
            } else {
                setErrors({ submit: 'Không thể thêm role. Vui lòng thử lại.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            roleId: '',
            roleName: ''
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
                        Thêm Role Mới
                    </h2>
                    <p className="text-green-100 mt-1">Tạo role mới cho hệ thống</p>
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

                    {/* Role ID */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Role ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="roleId"
                            value={formData.roleId}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: ROLE_MANAGER"
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                                errors.roleId 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : 'border-gray-300 focus:border-green-500'
                            }`}
                            disabled={loading}
                        />
                        {errors.roleId && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <span>⚠️</span>
                                {errors.roleId}
                            </p>
                        )}
                    </div>

                    {/* Role Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tên Role <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="roleName"
                            value={formData.roleName}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: Quản lý"
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                                errors.roleName 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : 'border-gray-300 focus:border-green-500'
                            }`}
                            disabled={loading}
                        />
                        {errors.roleName && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <span>⚠️</span>
                                {errors.roleName}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Đang thêm...
                                </>
                            ) : (
                                <>
                                    <span>➕</span>
                                    Thêm Role
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRoleModal;
