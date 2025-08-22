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
