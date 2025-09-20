import api from './api';

export const vehicleTypeService = {
    // Lấy tất cả loại xe
    getAllVehicleTypes: async () => {
        try {
            console.log('🛞 Calling vehicle types API...');
            const response = await api.get('/vehicle-types');
            console.log('🛞 Vehicle types API response:', response);
            console.log('🛞 Vehicle types data:', response.data);
            return response.data;
        } catch (error) {
            console.error('🛞 Error getting vehicle types:', error);
            console.error('🛞 Error response:', error.response);
            console.error('🛞 Error message:', error.message);
            throw error;
        }
    },

    // Thêm loại xe mới
    createVehicleType: async (vehicleTypeData) => {
        try {
            const response = await api.post('/vehicle-types', vehicleTypeData);
            return response.data;
        } catch (error) {
            console.error('Error creating vehicle type:', error);
            throw error;
        }
    },

    // Cập nhật loại xe
    updateVehicleType: async (vehicleTypeData) => {
        try {
            const response = await api.put('/vehicle-types', vehicleTypeData);
            return response.data;
        } catch (error) {
            console.error('Error updating vehicle type:', error);
            throw error;
        }
    },

    // Xóa loại xe
    deleteVehicleType: async (maLoaiXe) => {
        try {
            const response = await api.delete(`/vehicle-types/${maLoaiXe}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting vehicle type:', error);
            throw error;
        }
    },

    // Lấy loại xe theo mã
    getVehicleTypeById: async (maLoaiXe) => {
        try {
            const response = await api.get(`/vehicle-types/${maLoaiXe}`);
            return response.data;
        } catch (error) {
            console.error('Error getting vehicle type by id:', error);
            throw error;
        }
    }
};

export default vehicleTypeService;
