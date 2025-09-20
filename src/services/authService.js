import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

class AuthService {
    static setupInterceptors() {
        // Request interceptor to add token
        axios.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor to handle 401/403 errors
        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    console.log('Unauthorized access detected, logging out...');
                    this.clearAuthData();
                    
                    // Redirect to login
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    }
    // Logout function
    static async logout() {
        try {
            const token = localStorage.getItem('token');
            
            if (token) {
                // Call logout API
                const response = await axios.post(`${API_BASE_URL}/logout`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Logout API response:', response.data);
                return {
                    success: true,
                    message: response.data.message || 'Đăng xuất thành công!',
                    logoutTime: response.data.logoutTime
                };
            }
            
            return {
                success: true,
                message: 'Đăng xuất thành công!'
            };
            
        } catch (error) {
            console.error('Logout API error:', error);
            
            // Even if API fails, we still want to logout locally
            return {
                success: true, // Still return success to proceed with local logout
                message: 'Đăng xuất thành công!',
                apiError: true
            };
        }
    }
    
    // Clear all auth data from storage
    static clearAuthData() {
        try {
            // Remove token from localStorage
            localStorage.removeItem('token');
            
            // Remove any other auth-related data
            localStorage.removeItem('user');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('userRole');
            
            // Clear sessionStorage as well
            sessionStorage.clear();
            
            console.log('Auth data cleared successfully');
        } catch (error) {
            console.error('Error clearing auth data:', error);
        }
    }
    
    // Check if user is authenticated
    static isAuthenticated() {
        try {
            const token = localStorage.getItem('token');
            
            if (!token || token.trim() === '') {
                console.log('❌ authService.isAuthenticated: No token found');
                return false;
            }
            
            // Simple token existence check - let API handle validation
            console.log('🔒 authService.isAuthenticated: Token found, considering authenticated');
            return true;
        } catch (error) {
            console.error('❌ authService.isAuthenticated error:', error);
            return false;
        }
    }
    
    // Decode JWT token payload (without verification)
    static getTokenPayload(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }
    
    // Get current token
    static getToken() {
        return localStorage.getItem('token');
    }
    
    // Check authentication status with backend
    static async checkAuth() {
        try {
            const token = this.getToken();
            if (!token) {
                return {
                    success: false,
                    message: 'No token found'
                };
            }

            const response = await axios.get(`${API_BASE_URL}/check-auth`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return {
                success: true,
                message: response.data,
                user: this.getTokenPayload(token)
            };
            
        } catch (error) {
            console.error('Check auth error:', error);
            
            if (error.response?.status === 401) {
                this.clearAuthData();
            }
            
            return {
                success: false,
                message: error.response?.data || 'Authentication check failed'
            };
        }
    }
    
    // Get home page data
    static async getHomeData() {
        try {
            const response = await axios.get(`${API_BASE_URL}/`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return {
                success: true,
                message: response.data,
                isAuthenticated: true
            };
            
        } catch (error) {
            console.error('Get home data error:', error);
            
            return {
                success: false,
                message: error.response?.data || 'Failed to get home data',
                isAuthenticated: false
            };
        }
    }
    
    // Get dashboard data
    static async getDashboardData() {
        try {
            const response = await axios.get(`${API_BASE_URL}/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return {
                success: true,
                message: response.data,
                isAuthenticated: true
            };
            
        } catch (error) {
            console.error('Get dashboard data error:', error);
            
            if (error.response?.status === 401) {
                this.clearAuthData();
            }
            
            return {
                success: false,
                message: error.response?.data || 'Failed to get dashboard data',
                isAuthenticated: false
            };
        }
    }
    
    // Complete logout process
    static async performLogout() {
        try {
            // 1. Call logout API
            const apiResult = await this.logout();
            
            // 2. Clear local auth data regardless of API result
            this.clearAuthData();
            
            // 3. Return result for UI feedback
            return apiResult;
            
        } catch (error) {
            console.error('Error during logout process:', error);
            
            // Still clear local data even if everything fails
            this.clearAuthData();
            
            return {
                success: true,
                message: 'Đăng xuất thành công!',
                error: true
            };
        }
    }
    
    // Get token payload
    static getTokenPayload(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }
    
    // Get logged in user's name from token
    static getLoggedInUserName() {
        try {
            const token = this.getToken();
            if (!token) return 'User';
            
            const payload = this.getTokenPayload(token);
            if (!payload) return 'User';
            
            // Use the 'sub' claim which typically contains the username
            return payload.sub || 'User';
        } catch (error) {
            console.error('Error getting user name:', error);
            return 'User';
        }
    }
    
    // Get token from localStorage
    static getToken() {
        try {
            return localStorage.getItem('token') || '';
        } catch (error) {
            console.error('Error getting token:', error);
            return '';
        }
    }
}

export default AuthService;
