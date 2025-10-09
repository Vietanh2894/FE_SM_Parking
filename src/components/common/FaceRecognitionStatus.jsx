import React from 'react';

const FaceRecognitionStatus = ({ 
    isEnabled = false, 
    similarity = null, 
    status = null, 
    faceId = null,
    isProcessing = false,
    className = "" 
}) => {
    if (!isEnabled) {
        return (
            <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${className}`}>
                <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20a7.962 7.962 0 01-5.291-2.291M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="text-sm">Face Recognition: Tắt</span>
                </div>
            </div>
        );
    }

    if (isProcessing) {
        return (
            <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
                <div className="flex items-center gap-2 text-blue-700">
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm font-medium">Đang xử lý nhận diện khuôn mặt...</span>
                </div>
            </div>
        );
    }

    const getStatusInfo = () => {
        switch (status) {
            case 'VERIFIED_ENTRY':
                return {
                    color: 'green',
                    icon: '✅',
                    text: 'Xác thực vào thành công',
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    textColor: 'text-green-700'
                };
            case 'VERIFIED_EXIT':
                return {
                    color: 'green',
                    icon: '✅',
                    text: 'Xác thực ra thành công',
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    textColor: 'text-green-700'
                };
            case 'VERIFIED_BOTH':
                return {
                    color: 'green',
                    icon: '🎯',
                    text: 'Xác thực hoàn tất (vào + ra)',
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    textColor: 'text-green-700'
                };
            case 'FAILED_ENTRY':
                return {
                    color: 'red',
                    icon: '❌',
                    text: 'Xác thực vào thất bại',
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    textColor: 'text-red-700'
                };
            case 'FAILED_EXIT':
                return {
                    color: 'red',
                    icon: '❌',
                    text: 'Xác thực ra thất bại',
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    textColor: 'text-red-700'
                };
            case 'NOT_VERIFIED':
                return {
                    color: 'yellow',
                    icon: '⏳',
                    text: 'Chưa xác thực',
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    textColor: 'text-yellow-700'
                };
            case 'BYPASSED':
                return {
                    color: 'blue',
                    icon: '🔄',
                    text: 'Bỏ qua xác thực',
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    textColor: 'text-blue-700'
                };
            default:
                return {
                    color: 'blue',
                    icon: '🔍',
                    text: 'Face Recognition đã bật',
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    textColor: 'text-blue-700'
                };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <div className={`${statusInfo.bg} ${statusInfo.border} border rounded-lg p-3 ${className}`}>
            <div className="space-y-2">
                {/* Status */}
                <div className={`flex items-center gap-2 ${statusInfo.textColor}`}>
                    <span className="text-lg">{statusInfo.icon}</span>
                    <span className="text-sm font-medium">{statusInfo.text}</span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                    {faceId && (
                        <div className={statusInfo.textColor}>
                            <span className="font-medium">Face ID:</span>
                            <div className="font-mono bg-white px-2 py-1 rounded border mt-1">
                                {faceId}
                            </div>
                        </div>
                    )}
                    
                    {similarity !== null && (
                        <div className={statusInfo.textColor}>
                            <span className="font-medium">Độ tương đồng:</span>
                            <div className="font-mono bg-white px-2 py-1 rounded border mt-1">
                                {(similarity * 100).toFixed(1)}%
                            </div>
                        </div>
                    )}
                </div>

                {/* Similarity Bar */}
                {similarity !== null && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className={statusInfo.textColor}>Mức độ khớp</span>
                            <span className={`font-medium ${similarity >= 0.8 ? 'text-green-600' : similarity >= 0.6 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {similarity >= 0.8 ? 'Cao' : similarity >= 0.6 ? 'Trung bình' : 'Thấp'}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    similarity >= 0.8 ? 'bg-green-500' : 
                                    similarity >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(similarity * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FaceRecognitionStatus;