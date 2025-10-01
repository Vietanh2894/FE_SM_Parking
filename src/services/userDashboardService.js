import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

class UserDashboardService {
    // Get user dashboard data
    static async getUserDashboard() {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(`${API_BASE_URL}/user/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ UserDashboard API response:', response.data);

            if (response.data && response.data.statusCode === 200 && response.data.data) {
                // Handle nested response structure: response.data.data contains the actual data
                const actualData = response.data.data.data; // This contains userInfo, vehicles, etc.
                
                return {
                    success: true,
                    data: actualData, // Actual dashboard data with userInfo, vehicles, dangKyThangs, summary
                    message: response.data.data.message || response.data.message
                };
            } else {
                throw new Error('Invalid response format from server');
            }

        } catch (error) {
            console.error('❌ UserDashboard API error:', error);
            
            let errorMessage = 'Không thể tải thông tin dashboard';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối!';
            }
            
            return {
                success: false,
                error: errorMessage,
                data: null
            };
        }
    }

    // Refresh user dashboard data
    static async refreshDashboard() {
        return this.getUserDashboard();
    }

    // Get vehicle summary
    static async getVehicleSummary() {
        try {
            const dashboardResult = await this.getUserDashboard();
            if (dashboardResult.success && dashboardResult.data) {
                return {
                    success: true,
                    data: dashboardResult.data.summary
                };
            } else {
                return dashboardResult;
            }
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Không thể tải tóm tắt xe'
            };
        }
    }

    // Get active registrations
    static async getActiveRegistrations() {
        try {
            const dashboardResult = await this.getUserDashboard();
            if (dashboardResult.success && dashboardResult.data) {
                const activeRegistrations = dashboardResult.data.dangKyThangs.filter(
                    dk => dk.active && !dk.expired
                );
                return {
                    success: true,
                    data: activeRegistrations
                };
            } else {
                return dashboardResult;
            }
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Không thể tải danh sách đăng ký'
            };
        }
    }

    // Format currency
    static formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    // Format date
    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    // Calculate days until expiry
    static calculateDaysUntilExpiry(expiryDate) {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // Request extension for registration
    static async requestExtension(dangKyThangId, soThangGiaHan, ghiChu = '') {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('🔄 Sending extension request:', {
                dangKyThangId,
                soThangGiaHan,
                ghiChu
            });

            const requestData = {
                dangKyThangId: parseInt(dangKyThangId),
                soThangGiaHan: parseInt(soThangGiaHan),
                ghiChu: ghiChu || ''
            };

            const response = await axios.post(`${API_BASE_URL}/user/request-extension`, requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Extension request response:', response.data);

            if (response.data && response.data.statusCode === 200) {
                return {
                    success: true,
                    message: response.data.message || 'Yêu cầu gia hạn đã được gửi thành công!',
                    data: response.data.data
                };
            } else {
                throw new Error(response.data.message || 'Invalid response format from server');
            }

        } catch (error) {
            console.error('❌ Extension request error:', error);
            
            let errorMessage = 'Không thể gửi yêu cầu gia hạn';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối!';
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    // Create new vehicle for user
    static async createVehicle(vehicleData) {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('🔄 Creating new vehicle:', vehicleData);

            const requestData = {
                bienSoXe: vehicleData.bienSoXe.trim(),
                tenXe: vehicleData.tenXe.trim(),
                soCavet: vehicleData.soCavet?.trim() || '',
                maLoaiXe: vehicleData.maLoaiXe
            };

            const response = await axios.post(`${API_BASE_URL}/user/vehicles`, requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Create vehicle response:', response.data);

            if (response.data && response.data.statusCode === 201) {
                return {
                    success: true,
                    message: response.data.message || 'Tạo xe mới thành công!',
                    data: response.data.data
                };
            } else {
                throw new Error(response.data.message || 'Invalid response format from server');
            }

        } catch (error) {
            console.error('❌ Create vehicle error:', error);
            
            let errorMessage = 'Không thể tạo xe mới';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối!';
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    // Request monthly registration for vehicle
    static async requestMonthlyRegistration(registrationData) {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('🔄 Requesting monthly registration:', registrationData);

            const requestData = {
                bienSoXe: registrationData.bienSoXe.trim(),
                soThang: parseInt(registrationData.soThang),
                ghiChu: registrationData.ghiChu?.trim() || '',
                ngayBatDauMongMuon: registrationData.ngayBatDauMongMuon || '',
                soCavet: registrationData.soCavet?.trim() || '',
                maLoaiXe: registrationData.maLoaiXe
            };

            const response = await axios.post(`${API_BASE_URL}/user/monthly-registration-request`, requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Monthly registration request response:', response.data);

            if (response.data && response.data.statusCode === 200) {
                return {
                    success: true,
                    message: response.data.message || 'Yêu cầu đăng ký tháng đã được gửi thành công!',
                    data: response.data.data
                };
            } else {
                throw new Error(response.data.message || 'Invalid response format from server');
            }

        } catch (error) {
            console.error('❌ Monthly registration request error:', error);
            
            let errorMessage = 'Không thể gửi yêu cầu đăng ký tháng';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối!';
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }
}

export default UserDashboardService;