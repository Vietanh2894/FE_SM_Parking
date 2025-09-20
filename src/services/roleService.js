import api from './api';

const roleService = {
    // Get all roles
    getAllRoles: async () => {
        try {
            const response = await api.get('/roles');
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error fetching roles:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải danh sách chức vụ'
            };
        }
    },

    // Get role by ID
    getRoleById: async (roleId) => {
        try {
            const response = await api.get(`/roles/${roleId}`);
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error fetching role by ID:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải thông tin chức vụ'
            };
        }
    },

    // Create new role
    createRole: async (roleData) => {
        try {
            const response = await api.post('/roles', roleData);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Tạo chức vụ thành công'
            };
        } catch (error) {
            console.error('Error creating role:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tạo chức vụ'
            };
        }
    },

    // Update role
    updateRole: async (roleData) => {
        try {
            const response = await api.put('/roles', roleData);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Cập nhật chức vụ thành công'
            };
        } catch (error) {
            console.error('Error updating role:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi cập nhật chức vụ'
            };
        }
    },

    // Delete role
    deleteRole: async (roleId) => {
        try {
            const response = await api.delete(`/roles/${roleId}`);
            return {
                success: true,
                message: response.data.message || 'Xóa chức vụ thành công'
            };
        } catch (error) {
            console.error('Error deleting role:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi xóa chức vụ'
            };
        }
    }
};

export default roleService;
