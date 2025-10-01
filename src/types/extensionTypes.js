    // Types and interfaces for Extension Request system

// === CORE TYPES ===

export const EXTENSION_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED', 
    REJECTED: 'REJECTED'
};

export const REGISTRATION_STATUS = {
    ACTIVE: 'Đang hiệu lực',
    EXPIRED: 'Hết hạn',
    CANCELLED: 'Đã hủy'
};

// === INTERFACES ===

/**
 * Extension Request Form Interface
 */
export const ExtensionRequestForm = {
    dangKyThangId: 0,      // number - ID của đăng ký cần gia hạn
    soThangGiaHan: 1,      // number - Số tháng gia hạn (1-12)
    ghiChu: ''             // string? - Ghi chú (optional)
};

/**
 * Registration Interface
 */
export const Registration = {
    id: 0,                          // number
    bienSoXe: '',                   // string
    tenXe: '',                      // string
    soThang: 0,                     // number
    soTienThanhToan: 0,             // number
    thoiGianBatDau: '',             // string (ISO date)
    thoiGianHetHan: '',             // string (ISO date)
    trangThai: '',                  // string
    ghiChu: '',                     // string
    daysUntilExpiry: 0,             // number
    active: false,                  // boolean
    expired: false,                 // boolean
    hasPendingExtension: false      // boolean - custom field
};

/**
 * Extension Request Interface
 */
export const ExtensionRequest = {
    id: 0,                          // number
    dangKyThangId: 0,               // number
    bienSoXe: '',                   // string
    tenXe: '',                      // string
    soThangGiaHan: 0,               // number
    soTienThanhToan: 0,             // number
    thoiGianBatDau: '',             // string (ISO date)
    thoiGianHetHan: '',             // string (ISO date)
    trangThai: '',                  // string (PENDING/APPROVED/REJECTED)
    ghiChu: '',                     // string
    createdDate: '',                // string (ISO date)
    staffNote: ''                   // string - ghi chú từ staff khi duyệt/từ chối
};

/**
 * Extension State Interface
 */
export const ExtensionState = {
    isLoading: false,               // boolean
    activeRegistrations: [],        // Registration[]
    pendingRequests: [],            // ExtensionRequest[]
    selectedRegistration: null,     // Registration?
    showExtensionModal: false,      // boolean
    notification: null              // { type: 'success'|'error'|'info', message: string }?
};

/**
 * User Dashboard Data Interface
 */
export const UserDashboardData = {
    userInfo: {
        id: 0,
        name: '',
        email: '',
        cccd: '',
        sdt: '',
        diaChi: '',
        createdDate: ''
    },
    vehicles: [],                   // Vehicle[]
    dangKyThangs: [],              // Registration[]
    summary: {
        totalVehicles: 0,
        activeRegistrations: 0,
        expiredRegistrations: 0,
        totalAmountPaid: 0,
        nextExpiryDate: '',
        nextExpiryVehicle: ''
    }
};

// === VALIDATION HELPERS ===

/**
 * Validate Extension Request Form
 */
export const validateExtensionRequest = (formData) => {
    const errors = {};
    
    if (!formData.dangKyThangId || formData.dangKyThangId <= 0) {
        errors.dangKyThangId = 'Vui lòng chọn đăng ký cần gia hạn';
    }
    
    if (!formData.soThangGiaHan || formData.soThangGiaHan < 1 || formData.soThangGiaHan > 12) {
        errors.soThangGiaHan = 'Số tháng gia hạn phải từ 1 đến 12';
    }
    
    if (formData.ghiChu && formData.ghiChu.length > 500) {
        errors.ghiChu = 'Ghi chú không được vượt quá 500 ký tự';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Check if registration has pending extension
 */
export const hasPendingExtension = (registrationId, pendingRequests = []) => {
    return pendingRequests.some(request => 
        request.dangKyThangId === registrationId && 
        request.trangThai === EXTENSION_STATUS.PENDING
    );
};

/**
 * Get registration by ID
 */
export const findRegistrationById = (registrations = [], id) => {
    return registrations.find(reg => reg.id === id);
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

/**
 * Calculate days until expiry
 */
export const calculateDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

/**
 * Get status color classes for UI
 */
export const getStatusColor = (status) => {
    switch (status) {
        case EXTENSION_STATUS.PENDING:
            return {
                bg: 'bg-orange-100',
                text: 'text-orange-800'
            };
        case EXTENSION_STATUS.APPROVED:
            return {
                bg: 'bg-green-100', 
                text: 'text-green-800'
            };
        case EXTENSION_STATUS.REJECTED:
            return {
                bg: 'bg-red-100',
                text: 'text-red-800'
            };
        default:
            return {
                bg: 'bg-gray-100',
                text: 'text-gray-800'
            };
    }
};

/**
 * Get status icon component properties
 */
export const getStatusIcon = (status) => {
    switch (status) {
        case EXTENSION_STATUS.PENDING:
            return {
                path: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                viewBox: "0 0 24 24"
            };
        case EXTENSION_STATUS.APPROVED:
            return {
                path: "M5 13l4 4L19 7",
                viewBox: "0 0 24 24"
            };
        case EXTENSION_STATUS.REJECTED:
            return {
                path: "M6 18L18 6M6 6l12 12",
                viewBox: "0 0 24 24"
            };
        default:
            return {
                path: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                viewBox: "0 0 24 24"
            };
    }
};