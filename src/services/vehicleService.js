import api from './api';

const vehicleService = {
    // Get all vehicles with pagination
    getAllVehicles: async (params = {}) => {
        try {
            const response = await api.get('/vehicles', { params });
            console.log('Vehicle API response:', response.data);
            
            if (response.data.success || response.data.data) {
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
                    message: response.data.message || 'Lỗi khi tải danh sách xe'
                };
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải danh sách xe'
            };
        }
    },

    // Get vehicle by ID
    getVehicleById: async (id) => {
        try {
            const response = await api.get(`/vehicles/${id}`);
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Lỗi khi tải thông tin xe'
                };
            }
        } catch (error) {
            console.error('Error fetching vehicle:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải thông tin xe'
            };
        }
    },

    // Create new vehicle
    createVehicle: async (vehicleData) => {
        try {
            const response = await api.post('/vehicles', vehicleData);
            if (response.data.success || response.data.statusCode === 201) {
                return {
                    success: true,
                    data: response.data.data,
                    message: 'Tạo xe thành công'
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Lỗi khi tạo xe'
                };
            }
        } catch (error) {
            console.error('Error creating vehicle:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tạo xe'
            };
        }
    },

    // Update vehicle
    updateVehicle: async (id, vehicleData) => {
        try {
            const response = await api.put(`/vehicles/${id}`, vehicleData);
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: 'Cập nhật xe thành công'
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Lỗi khi cập nhật xe'
                };
            }
        } catch (error) {
            console.error('Error updating vehicle:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi cập nhật xe'
            };
        }
    },

    // Delete vehicle
    deleteVehicle: async (id) => {
        try {
            const response = await api.delete(`/vehicles/${id}`);
            if (response.data.success) {
                return {
                    success: true,
                    message: 'Xóa xe thành công'
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Lỗi khi xóa xe'
                };
            }
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi xóa xe'
            };
        }
    },

    // Search vehicles
    searchVehicles: async (searchTerm, filters = {}) => {
        try {
            const params = {
                search: searchTerm,
                ...filters
            };
            const response = await api.get('/vehicles/search', { params });
            
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data || []
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Lỗi khi tìm kiếm xe'
                };
            }
        } catch (error) {
            console.error('Error searching vehicles:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tìm kiếm xe'
            };
        }
    },

    // Get vehicle statistics
    getVehicleStats: async () => {
        try {
            const response = await api.get('/vehicles/stats');
            
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                // Fallback: calculate from all vehicles
                const allVehicles = await api.get('/vehicles');
                const vehicles = allVehicles.data.data || [];
                
                return {
                    success: true,
                    data: {
                        total: vehicles.length,
                        active: vehicles.filter(v => v.trangThai === 'HOAT_DONG' || v.status === 'ACTIVE').length,
                        inactive: vehicles.filter(v => v.trangThai === 'BI_KHOA' || v.status === 'INACTIVE').length
                    }
                };
            }
        } catch (error) {
            console.error('Error fetching vehicle statistics:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải thống kê xe',
                data: {
                    total: 0,
                    active: 0,
                    inactive: 0
                }
            };
        }
    }
};

export default vehicleService;
