import React, { useState, useRef } from 'react';

const ImageUploadWithPreview = ({ 
    onImageChange, 
    label = "Ảnh khuôn mặt", 
    isRequired = false,
    accept = "image/*",
    className = "",
    previewClassName = "w-32 h-32",
    disabled = false 
}) => {
    const [preview, setPreview] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageChange = (file) => {
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh hợp lệ');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước file không được vượt quá 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64String = e.target.result;
                setPreview(base64String);
                onImageChange(base64String, file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        handleImageChange(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (disabled) return;
        
        const file = e.dataTransfer.files[0];
        handleImageChange(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    const removeImage = () => {
        setPreview(null);
        onImageChange(null, null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <label className="block text-sm font-medium text-gray-700">
                {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            
            {/* Upload Area */}
            <div
                className={`
                    relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
                    ${dragActive 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={disabled}
                />
                
                {preview ? (
                    /* Preview Area */
                    <div className="p-4">
                        <div className="flex items-start gap-4">
                            {/* Image Preview */}
                            <div className={`flex-shrink-0 ${previewClassName} relative group`}>
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-lg shadow-md"
                                />
                                {/* Remove Button */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage();
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    disabled={disabled}
                                >
                                    ×
                                </button>
                            </div>
                            
                            {/* Image Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                    Ảnh đã chọn
                                </p>
                                <p className="text-xs text-gray-500 mb-2">
                                    Click để thay đổi ảnh khác
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>Ảnh hợp lệ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Upload Placeholder */
                    <div className="p-8 text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400 mb-4"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                        >
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium text-blue-600 hover:text-blue-500">
                                Click để chọn ảnh
                            </span>
                            {" hoặc kéo thả ảnh vào đây"}
                        </div>
                        <p className="text-xs text-gray-500">
                            PNG, JPG, GIF tối đa 5MB
                        </p>
                    </div>
                )}
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500">
                💡 Tip: Chọn ảnh khuôn mặt rõ nét, ánh sáng tốt để tăng độ chính xác nhận diện
            </p>
        </div>
    );
};

export default ImageUploadWithPreview;