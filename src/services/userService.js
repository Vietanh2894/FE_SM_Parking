import api from './api';

const userService = {
    // Get all users with pagination
    getAllUsers: async (params = {}) => {
        try {
            const response = await api.get('/users', { params });
            console.log('User API response:', response.data);
            
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data || [],
                    totalElements: response.data.totalElements || 0,
                    totalPages: response.data.totalPages || 1,
                    currentPage: response.data.currentPage || 0
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Lỗi khi tải danh sách người dùng'
                };
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải danh sách người dùng'
            };
        }
    },

    // Get user by ID
    getUserById: async (id) => {
        try {
            const response = await api.get(`/users/${id}`);
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Lỗi khi tải thông tin người dùng'
                };
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải thông tin người dùng'
            };
        }
    },

    // Create new user
    createUser: async (userData) => {
        try {
            const response = await api.post('/users', userData);
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: 'Tạo người dùng thành công'
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Lỗi khi tạo người dùng'
                };
            }
        } catch (error) {
            console.error('Error creating user:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tạo người dùng'
            };
        }
    },

    // Update user
    updateUser: async (id, userData) => {
        try {
            const response = await api.put(`/users/${id}`, userData);
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: 'Cập nhật người dùng thành công'
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Lỗi khi cập nhật người dùng'
                };
            }
        } catch (error) {
            console.error('Error updating user:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi cập nhật người dùng'
            };
        }
    },

    // Delete user
    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/users/${id}`);
            if (response.data.success) {
                return {
                    success: true,
                    message: 'Xóa người dùng thành công'
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Lỗi khi xóa người dùng'
                };
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi xóa người dùng'
            };
        }
    },

    // Get user statistics
    getUserStats: async () => {
        try {
            // Get counts for different statuses if backend supports it
            const response = await api.get('/users/stats');
            
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                // Fallback: calculate from all users
                const allUsers = await api.get('/users');
                const users = allUsers.data.data || [];
                
                return {
                    success: true,
                    data: {
                        total: users.length,
                        active: users.filter(u => u.trangThai === 'HOAT_DONG' || u.status === 'ACTIVE').length,
                        inactive: users.filter(u => u.trangThai === 'BI_KHOA' || u.status === 'INACTIVE').length,
                        admin: users.filter(u => u.vaiTro === 'ADMIN' || u.role === 'ADMIN').length
                    }
                };
            }
        } catch (error) {
            console.error('Error fetching user statistics:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải thống kê người dùng',
                data: {
                    total: 0,
                    active: 0,
                    inactive: 0,
                    admin: 0
                }
            };
        }
    },

    // Search users
    searchUsers: async (searchTerm, filters = {}) => {
        try {
            const params = {
                search: searchTerm,
                ...filters
            };
            const response = await api.get('/users/search', { params });
            
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data || []
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Lỗi khi tìm kiếm người dùng'
                };
            }
        } catch (error) {
            console.error('Error searching users:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tìm kiếm người dùng'
            };
        }
    }
};

export default userService;
