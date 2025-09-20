// Form validation constants
export const VALIDATION_MESSAGES = {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    MIN_PASSWORD_LENGTH: 'Password must be at least 6 characters long',
    PASSWORDS_DONT_MATCH: 'Passwords do not match'
};

// API endpoints
export const API_ENDPOINTS = {
    LOGIN: '/auth/login',
    USERS: '/users',
    VEHICLES: '/vehicles'
};

// Local storage keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user'
};

// Page sizes for pagination
export const PAGE_SIZES = [5, 10, 20, 50];

// Vehicle types
export const VEHICLE_TYPES = {
    CAR: 'car',
    MOTORCYCLE: 'motorcycle',
    BICYCLE: 'bicycle'
};

// Error messages for backend validation
export const ERROR_MESSAGES = {
    PAYMENT_REQUIRED: 'Cần thanh toán trước khi có thể chỉnh sửa',
    PAYMENT_ALREADY_COMPLETED: 'Đăng ký này đã được thanh toán',
    CANNOT_EDIT_PAID_REGISTRATION: 'Không thể chỉnh sửa đăng ký đã thanh toán',
    CANNOT_EXTEND_ACTIVE_REGISTRATION: 'Không thể gia hạn đăng ký đang hoạt động',
    CANNOT_EXTEND_PENDING_PAYMENT: 'Cần thanh toán trước khi gia hạn',
    USER_NOT_FOUND: 'Không tìm thấy người dùng',
    VEHICLE_NOT_FOUND: 'Không tìm thấy phương tiện',
    REGISTRATION_NOT_FOUND: 'Không tìm thấy đăng ký',
    INSUFFICIENT_BALANCE: 'Số dư không đủ để thực hiện thanh toán',
    INVALID_PAYMENT_STATUS: 'Trạng thái thanh toán không hợp lệ',
    INVALID_REGISTRATION_STATUS: 'Trạng thái đăng ký không hợp lệ'
};
