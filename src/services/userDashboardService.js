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
                return {
                    success: true,
                    data: response.data.data.data, // Actual dashboard data
                    message: response.data.message
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
}

export default UserDashboardService;