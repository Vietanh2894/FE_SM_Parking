import api from './api';

const accountService = {
    // Get all accounts with pagination and filtering
    getAllAccounts: async (params = {}) => {
        try {
            const response = await api.get('/accounts', { params });
            return {
                success: true,
                data: response.data.data || response.data,
                total: response.data.total || response.data.length || 0,
                currentPage: response.data.currentPage || 1,
                totalPages: response.data.totalPages || 1
            };
        } catch (error) {
            console.error('Error fetching accounts:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải danh sách tài khoản'
            };
        }
    },

    // Get account by username
    getAccountByUsername: async (username) => {
        try {
            const response = await api.get(`/accounts/${username}`);
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error fetching account by username:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải thông tin tài khoản'
            };
        }
    },

    // Search accounts by keyword
    searchAccounts: async (keyword, params = {}) => {
        try {
            const response = await api.get('/account/search', {
                params: { keyword, ...params }
            });
            return {
                success: true,
                data: response.data.data || response.data,
                total: response.data.total || response.data.length || 0
            };
        } catch (error) {
            console.error('Error searching accounts:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tìm kiếm tài khoản'
            };
        }
    },

    // Filter accounts by role
    getAccountsByRole: async (roleId, params = {}) => {
        try {
            const response = await api.get(`/accounts/role/${roleId}`, { params });
            return {
                success: true,
                data: response.data.data || response.data,
                total: response.data.total || response.data.length || 0
            };
        } catch (error) {
            console.error('Error filtering accounts by role:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi lọc tài khoản theo vai trò'
            };
        }
    },

    // Get active accounts by role
    getActiveAccountsByRole: async (roleId, params = {}) => {
        try {
            const response = await api.get(`/accounts/active/role/${roleId}`, { params });
            return {
                success: true,
                data: response.data.data || response.data,
                total: response.data.total || response.data.length || 0
            };
        } catch (error) {
            console.error('Error filtering active accounts by role:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi lọc tài khoản hoạt động theo vai trò'
            };
        }
    },

    // Filter accounts by status
    getAccountsByStatus: async (status, params = {}) => {
        try {
            const response = await api.get(`/accounts/status/${status}`, { params });
            return {
                success: true,
                data: response.data.data || response.data,
                total: response.data.total || response.data.length || 0
            };
        } catch (error) {
            console.error('Error filtering accounts by status:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi lọc tài khoản theo trạng thái'
            };
        }
    },

    // Get account statistics
    getAccountStats: async () => {
        try {
            // Get counts for different statuses
            const [enabledResult, disabledResult] = await Promise.all([
                api.get('/accounts/count/status/ENABLE'),
                api.get('/accounts/count/status/DISABLE')
            ]);

            const enabledCount = enabledResult.data.data || enabledResult.data || 0;
            const disabledCount = disabledResult.data.data || disabledResult.data || 0;

            return {
                success: true,
                data: {
                    total: enabledCount + disabledCount,
                    active: enabledCount,
                    inactive: disabledCount,
                    admin: 0 // This would need a separate endpoint or calculation
                }
            };
        } catch (error) {
            console.error('Error fetching account statistics:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải thống kê tài khoản',
                data: {
                    total: 0,
                    active: 0,
                    inactive: 0,
                    admin: 0
                }
            };
        }
    },

    // Create new account
    createAccount: async (accountData) => {
        try {
            const response = await api.post('/accounts', accountData);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Tạo tài khoản thành công'
            };
        } catch (error) {
            console.error('Error creating account:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tạo tài khoản'
            };
        }
    },

    // Update account
    updateAccount: async (accountData) => {
        try {
            const response = await api.put('/accounts', accountData);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Cập nhật tài khoản thành công'
            };
        } catch (error) {
            console.error('Error updating account:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi cập nhật tài khoản'
            };
        }
    },

    // Delete account
    deleteAccount: async (username) => {
        try {
            const response = await api.delete(`/accounts/${username}`);
            return {
                success: true,
                message: response.data.message || 'Xóa tài khoản thành công'
            };
        } catch (error) {
            console.error('Error deleting account:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi xóa tài khoản'
            };
        }
    },

    // Enable account
    enableAccount: async (username) => {
        try {
            const response = await api.post(`/accounts/${username}/enable`);
            return {
                success: true,
                message: response.data.message || 'Kích hoạt tài khoản thành công'
            };
        } catch (error) {
            console.error('Error enabling account:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi kích hoạt tài khoản'
            };
        }
    },

    // Disable account
    disableAccount: async (username) => {
        try {
            const response = await api.post(`/accounts/${username}/disable`);
            return {
                success: true,
                message: response.data.message || 'Vô hiệu hóa tài khoản thành công'
            };
        } catch (error) {
            console.error('Error disabling account:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi vô hiệu hóa tài khoản'
            };
        }
    },

    // Authenticate account
    authenticateAccount: async (credentials) => {
        try {
            const response = await api.post('/accounts/authenticate', credentials);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Xác thực thành công'
            };
        } catch (error) {
            console.error('Error authenticating account:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi xác thực tài khoản'
            };
        }
    },

    // Count accounts by status
    countAccountsByStatus: async (status) => {
        try {
            const response = await api.get(`/accounts/count/status/${status}`);
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error counting accounts by status:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi đếm tài khoản theo trạng thái'
            };
        }
    },

    // Update account status
    updateAccountStatus: async (id, status) => {
        try {
            const response = await api.patch(`/account/${id}/status`, { trangThai: status });
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Cập nhật trạng thái tài khoản thành công'
            };
        } catch (error) {
            console.error('Error updating account status:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi cập nhật trạng thái tài khoản'
            };
        }
    }
};

export default accountService;
