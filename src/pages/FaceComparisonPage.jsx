import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceRecognitionService from '../services/faceRecognitionService';
import ImageUpload from '../components/common/ImageUpload';
import { getConfidenceLevel, formatConfidencePercentage } from '../types/faceRecognitionTypes';
import { useToast } from '../components/common/NotificationToast';
import DashboardNavigation from '../components/DashboardNavigation';

const FaceComparisonPage = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [threshold, setThreshold] = useState(0.6);
    
    // First image state
    const [image1, setImage1] = useState(null);
    const [imagePreview1, setImagePreview1] = useState(null);
    const [error1, setError1] = useState(null);
    
    // Second image state
    const [image2, setImage2] = useState(null);
    const [imagePreview2, setImagePreview2] = useState(null);
    const [error2, setError2] = useState(null);
    
    // Results
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleImage1Select = (file, error, preview) => {
        if (error) {
            setError1(error);
            setImage1(null);
            setImagePreview1(null);
        } else {
            setImage1(file);
            setImagePreview1(preview);
            setError1(null);
            setResult(null); // Clear previous results
        }
    };

    const handleImage1Remove = () => {
        setImage1(null);
        setImagePreview1(null);
        setError1(null);
        setResult(null);
    };

    const handleImage2Select = (file, error, preview) => {
        if (error) {
            setError2(error);
            setImage2(null);
            setImagePreview2(null);
        } else {
            setImage2(file);
            setImagePreview2(preview);
            setError2(null);
            setResult(null); // Clear previous results
        }
    };

    const handleImage2Remove = () => {
        setImage2(null);
        setImagePreview2(null);
        setError2(null);
        setResult(null);
    };

    const handleCompare = async () => {
        if (!image1 || !image2) {
            toast?.showError(
                'Vui lòng chọn đủ hai ảnh để so sánh',
                'Thiếu ảnh',
                'Cần có ảnh thứ nhất và ảnh thứ hai'
            );
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const comparisonResult = await FaceRecognitionService.compareFacesFromFiles(image1, image2, threshold);

            console.log('Comparison result:', comparisonResult);
            setResult(comparisonResult.data);

            if (comparisonResult.success) {
                const similarity = comparisonResult.data.similarity;
                const isMatch = comparisonResult.data.match;

                if (isMatch) {
                    toast?.showSuccess(
                        `Hai khuôn mặt giống nhau`,
                        'Kết quả so sánh',
                        `Độ tương đồng: ${(similarity * 100).toFixed(1)}%`
                    );
                } else {
                    toast?.showWarning(
                        'Hai khuôn mặt khác nhau',
                        'Kết quả so sánh',
                        `Độ tương đồng: ${(similarity * 100).toFixed(1)}%`
                    );
                }
            } else {
                setError(comparisonResult.error);
                toast?.showError(
                    comparisonResult.error || 'So sánh thất bại',
                    'Lỗi so sánh'
                );
            }
        } catch (error) {
            console.error('Comparison error:', error);
            setError('Có lỗi xảy ra khi so sánh khuôn mặt');
            toast?.showError(
                'Có lỗi xảy ra khi so sánh',
                'Lỗi hệ thống',
                error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setImage1(null);
        setImagePreview1(null);
        setError1(null);
        setImage2(null);
        setImagePreview2(null);
        setError2(null);
        setResult(null);
        setError(null);
    };

    const getSimilarityColor = (similarity) => {
        if (similarity >= 0.8) return 'text-green-600 bg-green-50';
        if (similarity >= 0.6) return 'text-yellow-600 bg-yellow-50';
        if (similarity >= 0.4) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
    };

    const getSimilarityStatus = (similarity, isMatch) => {
        if (isMatch) {
            return { 
                label: 'Giống nhau', 
                color: 'text-green-600',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                )
            };
        } else {
            return { 
                label: 'Khác nhau', 
                color: 'text-red-600',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )
            };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardNavigation />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">So sánh khuôn mặt</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Tải lên hai ảnh để so sánh độ tương đồng giữa các khuôn mặt
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => navigate('/face-recognition')}
                                className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Nhận diện
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

                {/* Images Upload Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* First Image */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Ảnh thứ nhất</h3>
                        <ImageUpload
                            title="Ảnh khuôn mặt thứ nhất"
                            description="Kéo thả ảnh hoặc click để chọn"
                            onImageSelect={handleImage1Select}
                            onImageRemove={handleImage1Remove}
                            preview={imagePreview1}
                            error={error1}
                            loading={loading}
                            disabled={loading}
                        />
                    </div>

                    {/* Second Image */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Ảnh thứ hai</h3>
                        <ImageUpload
                            title="Ảnh khuôn mặt thứ hai"
                            description="Kéo thả ảnh hoặc click để chọn"
                            onImageSelect={handleImage2Select}
                            onImageRemove={handleImage2Remove}
                            preview={imagePreview2}
                            error={error2}
                            loading={loading}
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Threshold Control */}
                <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
                    <div className="max-w-md mx-auto">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Ngưỡng so sánh</h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600 w-16">Lỏng</span>
                                <div className="flex-1">
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1.0"
                                        step="0.1"
                                        value={threshold}
                                        onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                        disabled={loading}
                                    />
                                </div>
                                <span className="text-sm text-gray-600 w-16 text-right">Strict</span>
                            </div>
                            <div className="text-center">
                                <span className="text-lg font-medium text-blue-600">
                                    Ngưỡng: {threshold.toFixed(1)}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0.1 (Lỏng)</span>
                                <span>1.0 (Strict)</span>
                            </div>
                            <p className="text-xs text-gray-600 text-center mt-2">
                                Ngưỡng cao hơn yêu cầu độ tương đồng cao hơn để coi là "khớp"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4 mb-8">
                    <button
                        onClick={handleCompare}
                        disabled={!image1 || !image2 || loading}
                        className="inline-flex items-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Đang so sánh...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                So sánh khuôn mặt
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleReset}
                        disabled={loading}
                        className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Đặt lại
                    </button>
                </div>

                {/* Results Section */}
                <div className="bg-white shadow-sm rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Kết quả so sánh</h3>
                    
                    {!result && !error && !loading && (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-4 text-gray-500">Chọn hai ảnh và nhấn "So sánh khuôn mặt" để bắt đầu</p>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang phân tích và so sánh khuôn mặt...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-12">
                            <div className="text-red-500 mb-4">
                                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-red-600 font-medium">Lỗi so sánh</p>
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6">
                            {/* Comparison Result Header */}
                            <div className="text-center">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                                    result.match ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                    <div className={getSimilarityStatus(result.similarity, result.match).color}>
                                        {getSimilarityStatus(result.similarity, result.match).icon}
                                    </div>
                                </div>
                                <h4 className={`text-xl font-semibold mb-2 ${getSimilarityStatus(result.similarity, result.match).color}`}>
                                    {getSimilarityStatus(result.similarity, result.match).label}
                                </h4>
                            </div>

                            {/* Similarity Score */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h5 className="font-medium text-gray-900 mb-4 text-center">Độ tương đồng</h5>
                                
                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">0%</span>
                                        <span className={`px-3 py-1 rounded-full text-lg font-bold ${getSimilarityColor(result.similarity)}`}>
                                            {formatConfidencePercentage(result.similarity)}%
                                        </span>
                                        <span className="text-sm text-gray-600">100%</span>
                                    </div>
                                    <div className="bg-gray-200 rounded-full h-4">
                                        <div 
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${formatConfidencePercentage(result.similarity)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Similarity Level */}
                                <div className="text-center">
                                    <span className="text-sm text-gray-600">Mức độ tương đồng: </span>
                                    <span className={`font-medium ${getSimilarityColor(result.similarity)}`}>
                                        {getConfidenceLevel(result.similarity).label}
                                    </span>
                                </div>
                            </div>

                            {/* Match Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h6 className="font-medium text-gray-900 mb-2">Trạng thái khớp</h6>
                                    <div className="flex items-center">
                                        <div className={getSimilarityStatus(result.similarity, result.match).color}>
                                            {getSimilarityStatus(result.similarity, result.match).icon}
                                        </div>
                                        <span className={`ml-2 font-medium ${getSimilarityStatus(result.similarity, result.match).color}`}>
                                            {result.match ? 'Khớp' : 'Không khớp'}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h6 className="font-medium text-gray-900 mb-2">Ngưỡng so sánh</h6>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-gray-700">
                                            {result.threshold ? `${formatConfidencePercentage(result.threshold)}%` : 'Mặc định'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Processing Details */}
                            {(result.processing_time || result.confidence) && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h6 className="font-medium text-blue-900 mb-2">Chi tiết xử lý</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        {result.processing_time && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Thời gian xử lý:</span>
                                                <span className="text-blue-800 font-medium">{result.processing_time.toFixed(3)}s</span>
                                            </div>
                                        )}
                                        {result.confidence && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Độ tin cậy:</span>
                                                <span className="text-blue-800 font-medium">{formatConfidencePercentage(result.confidence)}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Interpretation Guide */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-yellow-800 font-medium text-sm">Hướng dẫn đọc kết quả:</p>
                                        <ul className="text-yellow-700 text-sm mt-1 list-disc list-inside space-y-1">
                                            <li>80-100%: Rất giống nhau, có thể là cùng một người</li>
                                            <li>60-80%: Tương đồng cao, cần xem xét thêm</li>
                                            <li>40-60%: Tương đồng trung bình</li>
                                            <li>0-40%: Khác nhau rõ rệt</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FaceComparisonPage;