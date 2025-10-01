import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceRecognitionService from '../services/faceRecognitionService';
import ImageUpload from '../components/common/ImageUpload';
import { validateFaceRegistration } from '../types/faceRecognitionTypes';
import { useToast } from '../components/common/NotificationToast';
import DashboardNavigation from '../components/DashboardNavigation';

const FaceRegistrationPage = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null,
        imagePreview: null
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    const handleImageSelect = (file, error, preview) => {
        if (error) {
            setErrors(prev => ({
                ...prev,
                image: error
            }));
            setFormData(prev => ({
                ...prev,
                image: null,
                imagePreview: null
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                image: file,
                imagePreview: preview
            }));
            setErrors(prev => ({
                ...prev,
                image: null
            }));
        }
    };

    const handleImageRemove = () => {
        setFormData(prev => ({
            ...prev,
            image: null,
            imagePreview: null
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const validation = validateFaceRegistration(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            toast?.showError('Vui lòng kiểm tra lại thông tin', 'Lỗi validation');
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            // Register face using file upload method
            const result = await FaceRecognitionService.registerFaceFromFile(
                formData.name.trim(),
                formData.image,
                formData.description.trim()
            );

            if (result.success) {
                toast?.showSuccess(
                    'Đăng ký khuôn mặt thành công!',
                    'Thành công',
                    `Đã đăng ký khuôn mặt cho "${formData.name}"`
                );
                
                // Reset form
                setFormData({
                    name: '',
                    description: '',
                    image: null,
                    imagePreview: null
                });
                
                // Navigate to face management page after 2 seconds
                setTimeout(() => {
                    navigate('/face-management');
                }, 2000);
                
            } else {
                toast?.showError(
                    result.error || 'Đăng ký thất bại',
                    'Lỗi đăng ký',
                    'Vui lòng thử lại hoặc liên hệ admin'
                );
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast?.showError(
                'Có lỗi xảy ra khi đăng ký',
                'Lỗi hệ thống',
                error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            name: '',
            description: '',
            image: null,
            imagePreview: null
        });
        setErrors({});
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardNavigation />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Đăng ký khuôn mặt</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Đăng ký khuôn mặt mới vào hệ thống nhận diện
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/face-management')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Quay lại
                        </button>
                    </div>
                </div>

                {/* Registration Form */}
                <div className="bg-white shadow-sm rounded-lg">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column - Form Fields */}
                            <div className="space-y-6">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên người dùng
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Nhập tên người dùng"
                                        maxLength={100}
                                        disabled={loading}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formData.name.length}/100 ký tự
                                    </p>
                                </div>

                                {/* Description Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mô tả (tùy chọn)
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={4}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.description ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Nhập mô tả về người dùng (vị trí, chức vụ, v.v.)"
                                        maxLength={500}
                                        disabled={loading}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formData.description.length}/500 ký tự
                                    </p>
                                </div>

                                {/* Guidelines */}
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                    <h3 className="text-sm font-medium text-blue-800 mb-2">
                                        Hướng dẫn chụp ảnh tốt nhất:
                                    </h3>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Mặt nhìn thẳng vào camera</li>
                                        <li>• Ánh sáng đều, tránh bóng mặt</li>
                                        <li>• Nền đơn giản, không có người khác</li>
                                        <li>• Khuôn mặt chiếm ít nhất 1/3 ảnh</li>
                                        <li>• Không đeo kính râm hoặc khẩu trang</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Right Column - Image Upload */}
                            <div>
                                <ImageUpload
                                    title="Ảnh khuôn mặt"
                                    description="Kéo thả ảnh hoặc click để chọn"
                                    onImageSelect={handleImageSelect}
                                    onImageRemove={handleImageRemove}
                                    preview={formData.imagePreview}
                                    error={errors.image}
                                    loading={loading}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={loading}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Đặt lại
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Đang đăng ký...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Đăng ký khuôn mặt
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FaceRegistrationPage;