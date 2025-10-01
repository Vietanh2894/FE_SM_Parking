import api from './api';
import AuthService from './authService';
import staffService from './staffService';
import roleService from './roleService';
import accountService from './accountService';
import ParkingTransactionService from './parkingTransactionService';
import dangKyThangService from './dangKyThangService';
import UserDashboardService from './userDashboardService';
import FaceRecognitionService from './faceRecognitionService';

export { default as AuthService } from './authService';
export { default as staffService } from './staffService';
export { default as roleService } from './roleService';
export { default as accountService } from './accountService';
export { default as ParkingTransactionService } from './parkingTransactionService';
export { default as dangKyThangService } from './dangKyThangService';
export { default as UserDashboardService } from './userDashboardService';
export { default as FaceRecognitionService } from './faceRecognitionService';

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => {
        localStorage.removeItem('token');
    },
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        return !!token;
    },
    getToken: () => localStorage.getItem('token')
};

export const userService = {
    getAllUsers: () => api.get('/users'),
    createUser: (user) => api.post('/users', user),
    updateUser: (id, user) => api.put(`/users/${id}`, user),
    deleteUser: (id) => api.delete(`/users/${id}`)
};

export const vehicleService = {
    getAllVehicles: () => api.get('/vehicles'),
    createVehicle: (vehicle) => api.post('/vehicles', vehicle),
    updateVehicle: (id, vehicle) => api.put(`/vehicles/${id}`, vehicle),
    deleteVehicle: (id) => api.delete(`/vehicles/${id}`)
};

export const vehicleTypeService = {
    getAllVehicleTypes: () => api.get('/vehicle-types'),
    getVehicleTypeById: (maLoaiXe) => api.get(`/vehicle-types/${maLoaiXe}`),
    createVehicleType: (vehicleType) => api.post('/vehicle-types', vehicleType),
    updateVehicleType: (vehicleType) => api.put('/vehicle-types', vehicleType),
    deleteVehicleType: (maLoaiXe) => api.delete(`/vehicle-types/${maLoaiXe}`)
};
