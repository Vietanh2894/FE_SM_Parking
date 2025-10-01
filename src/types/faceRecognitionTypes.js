// Face Recognition Types and Constants

export const FACE_RECOGNITION_STATUS = {
    SUCCESS: 'success',
    ERROR: 'error',
    PROCESSING: 'processing'
};

export const CONFIDENCE_LEVELS = {
    VERY_HIGH: { min: 0.9, label: 'Rất cao', color: 'green' },
    HIGH: { min: 0.8, label: 'Cao', color: 'green' },
    MEDIUM_HIGH: { min: 0.7, label: 'Trung bình cao', color: 'yellow' },
    MEDIUM: { min: 0.6, label: 'Trung bình', color: 'yellow' },
    LOW: { min: 0.5, label: 'Thấp', color: 'orange' },
    VERY_LOW: { min: 0.0, label: 'Rất thấp', color: 'red' }
};

export const IMAGE_CONSTRAINTS = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
    MIN_WIDTH: 100,
    MIN_HEIGHT: 100
};

/**
 * Face Registration Form Interface
 */
export const FaceRegistrationForm = {
    name: '',           // string (required, 1-100 chars)
    description: '',    // string (optional, max 500 chars)
    image: null,        // File object or base64 string
    imagePreview: ''    // string - preview URL
};

/**
 * Face Recognition Result Interface
 */
export const FaceRecognitionResult = {
    success: false,                 // boolean
    recognized: false,              // boolean
    person: {                       // object (if recognized)
        id: 0,                      // number
        name: '',                   // string
        description: '',            // string
        registrationDate: ''        // string (ISO date)
    },
    confidence: 0.0,                // number (0.0 - 1.0)
    confidencePercentage: 0,        // number (0 - 100)
    threshold: 0.6,                 // number
    processingTime: 0,              // number (milliseconds)
    message: ''                     // string
};

/**
 * Face Comparison Result Interface
 */
export const FaceComparisonResult = {
    success: false,                 // boolean
    match: false,                   // boolean
    similarity: 0.0,                // number (0.0 - 1.0)
    similarityPercentage: 0,        // number (0 - 100)
    threshold: 0.6,                 // number
    processingTime: 0,              // number (milliseconds)
    message: ''                     // string
};

/**
 * Registered Face Interface
 */
export const RegisteredFace = {
    id: 0,                          // number
    name: '',                       // string
    description: '',                // string
    imageUrl: '',                   // string - thumbnail URL
    registrationDate: '',           // string (ISO date)
    lastRecognized: '',             // string (ISO date)
    recognitionCount: 0,            // number
    isActive: true                  // boolean
};

/**
 * Face Management Filters
 */
export const FACE_FILTERS = {
    ALL: 'all',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    RECENT: 'recent'
};

export const FACE_SORT_OPTIONS = {
    NAME_ASC: { key: 'name', order: 'asc', label: 'Tên (A-Z)' },
    NAME_DESC: { key: 'name', order: 'desc', label: 'Tên (Z-A)' },
    DATE_DESC: { key: 'registrationDate', order: 'desc', label: 'Mới nhất' },
    DATE_ASC: { key: 'registrationDate', order: 'asc', label: 'Cũ nhất' },
    RECOGNITION_DESC: { key: 'recognitionCount', order: 'desc', label: 'Nhận diện nhiều nhất' }
};

// Validation functions

/**
 * Validate face registration form
 */
export const validateFaceRegistration = (formData) => {
    const errors = {};
    
    // Name validation
    if (!formData.name || formData.name.trim().length === 0) {
        errors.name = 'Tên là bắt buộc';
    } else if (formData.name.trim().length > 100) {
        errors.name = 'Tên không được vượt quá 100 ký tự';
    } else if (formData.name.trim().length < 1) {
        errors.name = 'Tên phải có ít nhất 1 ký tự';
    }
    
    // Description validation
    if (formData.description && formData.description.length > 500) {
        errors.description = 'Mô tả không được vượt quá 500 ký tự';
    }
    
    // Image validation
    if (!formData.image) {
        errors.image = 'Ảnh là bắt buộc';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate image file
 */
export const validateImageFile = (file) => {
    const errors = [];
    
    if (!file) {
        errors.push('Vui lòng chọn file ảnh');
        return { isValid: false, errors };
    }
    
    // Check file type
    if (!IMAGE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type)) {
        errors.push('Chỉ hỗ trợ file JPG, JPEG, PNG');
    }
    
    // Check file size
    if (file.size > IMAGE_CONSTRAINTS.MAX_SIZE) {
        errors.push(`Kích thước file không được vượt quá ${IMAGE_CONSTRAINTS.MAX_SIZE / (1024 * 1024)}MB`);
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Get confidence level info
 */
export const getConfidenceLevel = (confidence) => {
    for (const [key, level] of Object.entries(CONFIDENCE_LEVELS)) {
        if (confidence >= level.min) {
            return level;
        }
    }
    return CONFIDENCE_LEVELS.VERY_LOW;
};

/**
 * Format confidence as percentage
 */
export const formatConfidencePercentage = (confidence) => {
    return Math.round(confidence * 100);
};

/**
 * Get similarity color class for UI
 */
export const getSimilarityColorClass = (similarity) => {
    if (similarity >= 0.8) return 'text-green-600 bg-green-50';
    if (similarity >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
};

/**
 * Create image preview URL
 */
export const createImagePreview = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('No file provided'));
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target.result);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
};

/**
 * Convert file to base64 (without data URL prefix)
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            // Remove data:image/jpeg;base64, prefix
            const base64 = event.target.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Debounce function for search
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};