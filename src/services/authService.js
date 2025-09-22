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

    // Unified login function for both User and Staff
    static async login(credential, password) {
        try {
            console.log('🔐 AuthService: Attempting unified login with credential:', credential);
            
            const response = await axios.post(`${API_BASE_URL}/login`, {
                credential,
                password
            });

            console.log('✅ AuthService: Login response:', response.data);

            // Check response format based on backend specification
            if (response.data && response.data.statusCode === 200 && response.data.data) {
                const { accessToken, userType, userInfo, staffInfo } = response.data.data;
                
                if (!accessToken) {
                    throw new Error('No access token received');
                }

                // Store token (note: backend sends accessToken but we store as token)
                localStorage.setItem('token', accessToken);
                localStorage.setItem('userType', userType);
                
                if (userType === 'USER' && userInfo) {
                    localStorage.setItem('userInfo', JSON.stringify(userInfo));
                    localStorage.setItem('userRole', userInfo.role);
                    console.log('✅ User login successful:', userInfo);
                } else if (userType === 'STAFF' && staffInfo) {
                    localStorage.setItem('staffInfo', JSON.stringify(staffInfo));
                    localStorage.setItem('userRole', staffInfo.chucVu);
                    console.log('✅ Staff login successful:', staffInfo);
                }
                
                return {
                    success: true,
                    data: response.data.data,
                    userType,
                    userInfo: userType === 'USER' ? userInfo : null,
                    staffInfo: userType === 'STAFF' ? staffInfo : null
                };
            } else {
                throw new Error('Invalid response format from server');
            }
            
        } catch (error) {
            console.error('❌ AuthService login error:', error);
            
            let errorMessage = 'Đăng nhập thất bại';
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
            localStorage.removeItem('staffInfo');
            localStorage.removeItem('userType');
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
    
    // Get logged in user's name from token or stored info
    static getLoggedInUserName() {
        try {
            const userType = localStorage.getItem('userType');
            
            if (userType === 'USER') {
                const userInfo = localStorage.getItem('userInfo');
                if (userInfo) {
                    const parsed = JSON.parse(userInfo);
                    return parsed.name || parsed.email || 'User';
                }
            } else if (userType === 'STAFF') {
                const staffInfo = localStorage.getItem('staffInfo');
                if (staffInfo) {
                    const parsed = JSON.parse(staffInfo);
                    return parsed.hoTen || parsed.maNV || 'Staff';
                }
            }
            
            // Fallback to token payload
            const token = this.getToken();
            if (token) {
                const payload = this.getTokenPayload(token);
                if (payload) {
                    return payload.sub || 'User';
                }
            }
            
            return 'User';
        } catch (error) {
            console.error('Error getting user name:', error);
            return 'User';
        }
    }

    // Get current user type
    static getUserType() {
        return localStorage.getItem('userType');
    }

    // Get current user info based on type
    static getCurrentUserInfo() {
        try {
            const userType = this.getUserType();
            
            if (userType === 'USER') {
                const userInfo = localStorage.getItem('userInfo');
                return userInfo ? JSON.parse(userInfo) : null;
            } else if (userType === 'STAFF') {
                const staffInfo = localStorage.getItem('staffInfo');
                return staffInfo ? JSON.parse(staffInfo) : null;
            }
            
            return null;
        } catch (error) {
            console.error('Error getting current user info:', error);
            return null;
        }
    }

    // Get current user role
    static getCurrentUserRole() {
        try {
            const userType = this.getUserType();
            
            if (userType === 'USER') {
                const userInfo = this.getCurrentUserInfo();
                return userInfo?.role || 'USER';
            } else if (userType === 'STAFF') {
                const staffInfo = this.getCurrentUserInfo();
                return staffInfo?.chucVu || 'STAFF';
            }
            
            return localStorage.getItem('userRole') || 'USER';
        } catch (error) {
            console.error('Error getting current user role:', error);
            return 'USER';
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
