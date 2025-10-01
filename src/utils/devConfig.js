// Development configuration
export const DEV_CONFIG = {
    // API Configuration
    API_BASE_URL: 'http://localhost:8080',
    
    // Feature flags
    USE_MOCK_DATA: false, // Set to true when backend is not available
    ENABLE_API_CALLS: true, // Set to false to disable all API calls
    
    // Debug settings
    ENABLE_CONSOLE_LOGS: true,
    SHOW_API_ERRORS: true,
    
    // Mock data settings
    MOCK_USER_DATA: {
        id: 1,
        name: 'Demo User',
        email: 'demo@parking.com',
        cccd: '123456789',
        sdt: '0123456789',
        diaChi: '123 Demo Street',
        userType: 'USER'
    },
    
    // Demo registrations
    MOCK_REGISTRATIONS: [
        {
            id: 1,
            bienSoXe: '30A-12345',
            tenXe: 'Honda Wave Alpha',
            soThang: 6,
            soTienThanhToan: 1200000,
            thoiGianBatDau: '2024-01-01',
            thoiGianHetHan: '2024-07-01',
            trangThai: 'ACTIVE',
            ghiChu: 'Đăng ký 6 tháng',
            daysUntilExpiry: 30
        },
        {
            id: 2,
            bienSoXe: '30B-67890',
            tenXe: 'Yamaha Exciter 150',
            soThang: 3,
            soTienThanhToan: 600000,
            thoiGianBatDau: '2024-02-01',
            thoiGianHetHan: '2024-05-01',
            trangThai: 'ACTIVE',
            ghiChu: 'Đăng ký 3 tháng',
            daysUntilExpiry: 5
        },
        {
            id: 3,
            bienSoXe: '29C-11111',
            tenXe: 'Honda Air Blade',
            soThang: 12,
            soTienThanhToan: 2400000,
            thoiGianBatDau: '2023-08-01',
            thoiGianHetHan: '2024-08-01',
            trangThai: 'EXPIRED',
            ghiChu: 'Đã hết hạn',
            daysUntilExpiry: -30
        }
    ],
    
    // Demo pending extensions
    MOCK_PENDING_EXTENSIONS: [
        {
            id: 101,
            dangKyThangId: 1,
            bienSoXe: '30A-12345',
            tenXe: 'Honda Wave Alpha',
            soThangGiaHan: 3,
            soTien: 600000,
            lyDoGiaHan: 'Cần gia hạn thêm để tiếp tục sử dụng',
            trangThai: 'PENDING',
            ngayTao: '2024-09-20',
            ngayXuLy: null,
            ghiChuAdmin: null
        }
    ],

    // Demo vehicle types
    MOCK_VEHICLE_TYPES: [
        {
            maLoaiXe: 'LX001',
            tenLoaiXe: 'Xe máy',
            moTa: 'Xe máy các loại',
            giaThang: 200000
        },
        {
            maLoaiXe: 'LX002',
            tenLoaiXe: 'Xe ô tô',
            moTa: 'Xe ô tô các loại',
            giaThang: 500000
        }
    ]
};

// Helper functions for development
export const getDevConfig = () => DEV_CONFIG;

export const isMockModeEnabled = () => DEV_CONFIG.USE_MOCK_DATA;

export const isApiEnabled = () => DEV_CONFIG.ENABLE_API_CALLS;

export const logDevInfo = (message, data = null) => {
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS) {
        console.log(`[DEV] ${message}`, data);
    }
};

export const logApiError = (error, context = '') => {
    if (DEV_CONFIG.SHOW_API_ERRORS) {
        console.warn(`[API ERROR] ${context}:`, error);
    }
};