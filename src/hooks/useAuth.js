import { useState, useEffect } from 'react';
import { authService } from '../services';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const authenticated = authService.isAuthenticated();
            setIsAuthenticated(authenticated);
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                setIsAuthenticated(true);
                return { success: true };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const logout = () => {
        authService.logout();
        setIsAuthenticated(false);
    };

    return {
        isAuthenticated,
        loading,
        login,
        logout
    };
};
