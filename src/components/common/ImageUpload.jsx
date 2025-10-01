import React, { useState, useRef } from 'react';
import { validateImageFile } from '../../types/faceRecognitionTypes';

const ImageUpload = ({ 
    onImageSelect, 
    onImageRemove, 
    acceptedTypes = "image/jpeg,image/jpg,image/png",
    maxSize = 10, // MB
    title = "Tải lên ảnh",
    description = "Kéo thả file hoặc click để chọn",
    preview = null,
    error = null,
    loading = false,
    disabled = false,
    className = ""
}) => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (disabled || loading) return;
        
        const files = Array.from(e.dataTransfer.files);
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileSelect = (file) => {
        if (!file || disabled || loading) return;

        const validation = validateImageFile(file);
        if (!validation.isValid) {
            if (onImageSelect) {
                onImageSelect(null, validation.errors[0]);
            }
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
            if (onImageSelect) {
                onImageSelect(file, null, event.target.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleClick = () => {
        if (!disabled && !loading && inputRef.current) {
            inputRef.current.click();
        }
    };

    const handleRemove = () => {
        if (onImageRemove) {
            onImageRemove();
        }
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                    {title}
                    <span className="text-red-500 ml-1">*</span>
                </label>
            </div>

            {!preview ? (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive 
                            ? 'border-blue-400 bg-blue-50' 
                            : error 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300 hover:border-gray-400'
                    } ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleClick}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={acceptedTypes}
                        onChange={handleInputChange}
                        className="hidden"
                        disabled={disabled || loading}
                    />

                    <div className="space-y-2">
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-sm text-gray-600">Đang xử lý...</p>
                            </>
                        ) : (
                            <>
                                <svg 
                                    className={`mx-auto h-12 w-12 ${error ? 'text-red-400' : 'text-gray-400'}`} 
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
                                <div>
                                    <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-600'}`}>
                                        {description}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        JPG, PNG tối đa {maxSize}MB
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <div className="border-2 border-gray-200 rounded-lg p-4">
                        <img 
                            src={preview} 
                            alt="Preview" 
                            className="w-full max-h-64 object-contain rounded-lg"
                        />
                        <div className="mt-3 flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                <p className="font-medium">Ảnh đã chọn</p>
                                <p className="text-xs">Click để thay đổi</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleRemove}
                                disabled={disabled || loading}
                                className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                    
                    {/* Overlay for changing image */}
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg cursor-pointer flex items-center justify-center"
                        onClick={handleClick}
                    >
                        <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                            <div className="bg-white rounded-full p-2 shadow-lg">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <p className="mt-2 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
};

export default ImageUpload;