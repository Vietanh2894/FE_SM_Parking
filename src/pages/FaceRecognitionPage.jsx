import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceRecognitionService from '../services/faceRecognitionService';
import ImageUpload from '../components/common/ImageUpload';
import { getConfidenceLevel, formatConfidencePercentage } from '../types/faceRecognitionTypes';
import { useToast } from '../components/common/NotificationToast';
import DashboardNavigation from '../components/DashboardNavigation';

const FaceRecognitionPage = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [threshold, setThreshold] = useState(0.6);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleImageSelect = (file, error, preview) => {
        if (error) {
            setError(error);
            setImage(null);
            setImagePreview(null);
        } else {
            setImage(file);
            setImagePreview(preview);
            setError(null);
            setResult(null); // Clear previous results
        }
    };

    const handleImageRemove = () => {
        setImage(null);
        setImagePreview(null);
        setResult(null);
        setError(null);
    };

    const handleRecognize = async () => {
        if (!image) {
            toast?.showError('Vui lòng chọn ảnh để nhận diện', 'Thiếu ảnh');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const recognitionResult = await FaceRecognitionService.recognizeFaceFromFile(image, threshold);
            
            console.log('Recognition result:', recognitionResult);
            setResult(recognitionResult.data);

            if (recognitionResult.success && recognitionResult.data.face_id !== null) {
                // Nhận diện thành công - có face_id
                toast?.showSuccess(
                    `Nhận diện thành công: ${recognitionResult.data.name}`,
                    'Nhận diện thành công',
                    `Độ tương đồng: ${(recognitionResult.data.similarity * 100).toFixed(1)}%`
                );
            } else if (!recognitionResult.success && recognitionResult.data.face_id === null) {
                // Không nhận diện được - face_id là null
                toast?.showWarning(
                    'Không nhận diện được khuôn mặt',
                    'Không tìm thấy',
                    `${recognitionResult.data.message || 'Khuôn mặt này chưa được đăng ký trong hệ thống'}`
                );
            } else {
                // Lỗi API hoặc trường hợp khác
                setError(recognitionResult.error);
                toast?.showError(
                    recognitionResult.error || 'Nhận diện thất bại',
                    'Lỗi nhận diện'
                );
            }
        } catch (error) {
            console.error('Recognition error:', error);
            setError('Có lỗi xảy ra khi nhận diện khuôn mặt');
            toast?.showError(
                'Có lỗi xảy ra khi nhận diện',
                'Lỗi hệ thống',
                error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setImage(null);
        setImagePreview(null);
        setResult(null);
        setError(null);
        setThreshold(0.6);
    };

    const getConfidenceColor = (confidence) => {
        const level = getConfidenceLevel(confidence);
        switch (level.color) {
            case 'green': return 'text-green-600 bg-green-50';
            case 'yellow': return 'text-yellow-600 bg-yellow-50';
            case 'orange': return 'text-orange-600 bg-orange-50';
            case 'red': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardNavigation />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Nhận diện khuôn mặt</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Tải lên ảnh để nhận diện khuôn mặt trong hệ thống
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => navigate('/face-registration')}
                                className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Đăng ký mới
                            </button>
                            <button
                                onClick={() => navigate('/face-management')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Quản lý khuôn mặt
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Image Upload & Settings */}
                    <div className="space-y-6">
                        {/* Image Upload */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <ImageUpload
                                title="Ảnh cần nhận diện"
                                description="Kéo thả ảnh hoặc click để chọn"
                                onImageSelect={handleImageSelect}
                                onImageRemove={handleImageRemove}
                                preview={imagePreview}
                                error={error}
                                loading={loading}
                                disabled={loading}
                            />
                        </div>

                        {/* Settings */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt nhận diện</h3>
                            
                            <div className="space-y-4">
                                {/* Threshold Slider */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ngưỡng độ tin cậy: {threshold.toFixed(1)}
                                    </label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1.0"
                                        step="0.1"
                                        value={threshold}
                                        onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        disabled={loading}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>0.1 (Lỏng)</span>
                                        <span>1.0 (Strict)</span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2">
                                        Ngưỡng cao hơn sẽ yêu cầu độ chính xác cao hơn
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={handleRecognize}
                                disabled={!image || loading}
                                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Đang nhận diện...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Nhận diện
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={loading}
                                className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Đặt lại
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Results */}
                    <div>
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Kết quả nhận diện</h3>
                            
                            {!result && !error && (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <p className="mt-4 text-gray-500">Chọn ảnh và nhấn "Nhận diện" để bắt đầu</p>
                                </div>
                            )}

                            {error && (
                                <div className="text-center py-12">
                                    <div className="text-red-500 mb-4">
                                        <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-red-600 font-medium">Lỗi nhận diện</p>
                                    <p className="text-red-500 text-sm mt-1">{error}</p>
                                </div>
                            )}

                            {result && (
                                <div className="space-y-6">
                                    {result.face_id !== null ? (
                                        <>
                                            {/* Recognition Success */}
                                            <div className="text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <h4 className="text-xl font-semibold text-green-600 mb-2">
                                                    Nhận diện thành công!
                                                </h4>
                                            </div>

                            {/* Person Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h5 className="font-medium text-gray-900 mb-3">Thông tin người được nhận diện:</h5>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tên:</span>
                                        <span className="font-medium">{result.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">ID:</span>
                                        <span className="font-medium">#{result.face_id || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Độ tương đồng:</span>
                                        <span className="font-medium">{(result.similarity * 100).toFixed(2)}%</span>
                                    </div>
                                </div>
                            </div>                                            {/* Confidence Score */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h5 className="font-medium text-gray-900 mb-3">Độ tin cậy:</h5>
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-1">
                                                        <div className="bg-gray-200 rounded-full h-3">
                                                            <div 
                                                                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                                                style={{ width: `${formatConfidencePercentage(result.confidence)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                                                        {formatConfidencePercentage(result.confidence)}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm text-gray-600 mt-2">
                                                    <span>Độ tin cậy: {getConfidenceLevel(result.confidence).label}</span>
                                                    <span>Ngưỡng: {formatConfidencePercentage(threshold)}%</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Recognition Failed */}
                                            <div className="text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                                                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h4 className="text-xl font-semibold text-yellow-600 mb-2">
                                                    Không nhận diện được
                                                </h4>
                                                <p className="text-gray-600">
                                                    Khuôn mặt này chưa được đăng ký trong hệ thống
                                                </p>
                                            </div>

                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <div className="flex items-start">
                                                    <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-blue-800 font-medium text-sm">Gợi ý:</p>
                                                        <p className="text-blue-700 text-sm mt-1">
                                                            Bạn có thể thử giảm ngưỡng độ tin cậy hoặc đăng ký khuôn mặt mới vào hệ thống.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Processing Time */}
                                    {result.processing_time && (
                                        <div className="text-center text-sm text-gray-500">
                                            Thời gian xử lý: {result.processing_time.toFixed(3)}s
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceRecognitionPage;