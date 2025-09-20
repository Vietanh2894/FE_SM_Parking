import axios from 'axios';

// Create API instance
const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle unauthorized access and standardize responses
api.interceptors.response.use(
    (response) => {
        console.log('📦 API Response interceptor:', response.status, response.config.url);
        
        // Check if response is in the expected format
        // Backend format: { statusCode, error, message, data }
        const responseData = response.data;
        
        if (responseData && typeof responseData === 'object' && 'statusCode' in responseData) {
            // Check for unauthorized in the response statusCode
            if (responseData.statusCode === 401) {
                console.log('🚫 Unauthorized response detected in statusCode');
                localStorage.removeItem('token');
                window.location.href = '/login';
                return Promise.reject(new Error('Unauthorized'));
            }
            
            // Format is correct, return as is
            return response;
        }
        
        // If response is not in the expected format, wrap it
        // This helps standardize API responses
        console.log('⚠️ Response not in standard format, standardizing');
        const wrappedResponse = {
            ...response,
            data: {
                statusCode: response.status,
                error: null,
                message: 'API Response',
                data: response.data
            }
        };
        
        return wrappedResponse;
    },
    (error) => {
        console.error('❌ API Error interceptor:', error);
        
        if (error.response?.status === 401) {
            console.log('🚫 Unauthorized response detected in status code');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        // Return a standardized error response if possible
        if (error.response) {
            const errorResponse = {
                ...error,
                response: {
                    ...error.response,
                    data: {
                        statusCode: error.response.status,
                        error: true,
                        message: error.response.data?.message || 'Request failed',
                        data: null
                    }
                }
            };
            return Promise.reject(errorResponse);
        }
        
        return Promise.reject(error);
    }
);

export default api;
