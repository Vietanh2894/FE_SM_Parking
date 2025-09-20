import api from './api';

const staffService = {
    // Get all staff with pagination and filtering
    getAllStaff: async (params = {}) => {
        try {
            const response = await api.get('/staff', { params });
            return {
                success: true,
                data: response.data.data || response.data,
                total: response.data.total || response.data.length || 0,
                currentPage: response.data.currentPage || 1,
                totalPages: response.data.totalPages || 1
            };
        } catch (error) {
            console.error('Error fetching staff:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải danh sách nhân viên'
            };
        }
    },

    // Get staff by ID
    getStaffById: async (id) => {
        try {
            const response = await api.get(`/staff/${id}`);
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error fetching staff by ID:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải thông tin nhân viên'
            };
        }
    },

    // Search staff by keyword
    searchStaff: async (keyword, params = {}) => {
        try {
            const response = await api.get('/staff/search', {
                params: { name: keyword, ...params }
            });
            return {
                success: true,
                data: response.data.data || response.data,
                total: response.data.total || response.data.length || 0
            };
        } catch (error) {
            console.error('Error searching staff:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tìm kiếm nhân viên'
            };
        }
    },

    // Filter staff by role
    getStaffByRole: async (role, params = {}) => {
        try {
            const response = await api.get(`/staff/chuc-vu/${role}`, { params });
            return {
                success: true,
                data: response.data.data || response.data,
                total: response.data.total || response.data.length || 0
            };
        } catch (error) {
            console.error('Error filtering staff by role:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi lọc nhân viên theo chức vụ'
            };
        }
    },

    // Get active staff by role
    getActiveStaffByRole: async (role, params = {}) => {
        try {
            const response = await api.get(`/staff/active/chuc-vu/${role}`, { params });
            return {
                success: true,
                data: response.data.data || response.data,
                total: response.data.total || response.data.length || 0
            };
        } catch (error) {
            console.error('Error filtering active staff by role:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi lọc nhân viên hoạt động theo chức vụ'
            };
        }
    },

    // Get staff with active accounts
    getActiveStaff: async (params = {}) => {
        try {
            const response = await api.get('/staff/active', { params });
            return {
                success: true,
                data: response.data.data || response.data,
                total: response.data.total || response.data.length || 0
            };
        } catch (error) {
            console.error('Error getting active staff:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi lấy nhân viên có tài khoản hoạt động'
            };
        }
    },

    // Get staff statistics
    getStaffStats: async () => {
        try {
            const response = await api.get('/staff/statistics');
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error fetching staff statistics:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải thống kê nhân viên'
            };
        }
    },

    // Create new staff
    createStaff: async (staffData) => {
        try {
            const response = await api.post('/staff', staffData);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Tạo nhân viên thành công'
            };
        } catch (error) {
            console.error('Error creating staff:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tạo nhân viên'
            };
        }
    },

    // Update staff
    updateStaff: async (staffData) => {
        try {
            const response = await api.put('/staff', staffData);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Cập nhật nhân viên thành công'
            };
        } catch (error) {
            console.error('Error updating staff:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi cập nhật nhân viên'
            };
        }
    },

    // Delete staff
    deleteStaff: async (maNV) => {
        try {
            const response = await api.delete(`/staff/${maNV}`);
            return {
                success: true,
                message: response.data.message || 'Xóa nhân viên thành công'
            };
        } catch (error) {
            console.error('Error deleting staff:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi xóa nhân viên'
            };
        }
    },

    // Update staff status
    updateStaffStatus: async (id, status) => {
        try {
            const response = await api.patch(`/nhan-vien/${id}/status`, { trangThai: status });
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Cập nhật trạng thái nhân viên thành công'
            };
        } catch (error) {
            console.error('Error updating staff status:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi cập nhật trạng thái nhân viên'
            };
        }
    },

    // Assign role to staff
    assignRole: async (staffId, roleId) => {
        try {
            const response = await api.post(`/nhan-vien/${staffId}/assign-role`, { roleId });
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Gán chức vụ thành công'
            };
        } catch (error) {
            console.error('Error assigning role:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi gán chức vụ'
            };
        }
    },

    // Get staff salary information
    getStaffSalary: async (id) => {
        try {
            const response = await api.get(`/nhan-vien/${id}/salary`);
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error fetching staff salary:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải thông tin lương'
            };
        }
    },

    // Update staff salary
    updateStaffSalary: async (id, salaryData) => {
        try {
            const response = await api.patch(`/nhan-vien/${id}/salary`, salaryData);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Cập nhật lương thành công'
            };
        } catch (error) {
            console.error('Error updating staff salary:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi cập nhật lương'
            };
        }
    },

    // Get staff by username
    getStaffByUsername: async (username) => {
        try {
            const response = await api.get(`/staff/account/${username}`);
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error fetching staff by username:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải nhân viên theo username'
            };
        }
    },

    // Get staff by email
    getStaffByEmail: async (email) => {
        try {
            const response = await api.get(`/staff/email/${email}`);
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error fetching staff by email:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải nhân viên theo email'
            };
        }
    },

    // Get staff by CCCD
    getStaffByCCCD: async (cccd) => {
        try {
            const response = await api.get(`/staff/cccd/${cccd}`);
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error fetching staff by CCCD:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải nhân viên theo CCCD'
            };
        }
    },

    // Get staff by phone number
    getStaffByPhone: async (sdt) => {
        try {
            const response = await api.get(`/staff/sdt/${sdt}`);
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error fetching staff by phone:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải nhân viên theo SĐT'
            };
        }
    },

    // Get staff by date range
    getStaffByDateRange: async (startDate, endDate) => {
        try {
            const response = await api.get('/staff/ngay-vao-lam', {
                params: { startDate, endDate }
            });
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error fetching staff by date range:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải nhân viên theo ngày vào làm'
            };
        }
    },

    // Count staff by position
    countStaffByPosition: async (chucVu) => {
        try {
            const response = await api.get(`/staff/count/chuc-vu/${chucVu}`);
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error counting staff by position:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi đếm nhân viên theo chức vụ'
            };
        }
    },

    // Check if staff can manage staff account
    canManageStaffAccount: async (maNV) => {
        try {
            const response = await api.get(`/staff/${maNV}/can-manage-staff-account`);
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error checking manage permission:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi kiểm tra quyền quản lý'
            };
        }
    },

    // Check if staff is admin
    isAdmin: async (maNV) => {
        try {
            const response = await api.get(`/staff/${maNV}/is-admin`);
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error checking admin status:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi kiểm tra quyền Admin'
            };
        }
    },

    // Check if staff is security guard
    isBaoVe: async (maNV) => {
        try {
            const response = await api.get(`/staff/${maNV}/is-bao-ve`);
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error checking security guard status:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi kiểm tra quyền Bảo vệ'
            };
        }
    }
};

export default staffService;
