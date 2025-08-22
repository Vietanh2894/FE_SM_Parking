import api from './api';

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
