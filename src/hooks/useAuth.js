import { useState, useEffect } from 'react';
import { authService } from '../services';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuth = () => {
            console.log('🔒 useAuth: Starting authentication check...');
            const authenticated = authService.isAuthenticated();
            console.log('🔒 useAuth authentication result:', authenticated);
            setIsAuthenticated(authenticated);
            
            // Get user info from localStorage or token
            if (authenticated) {
                const token = localStorage.getItem('token');
                console.log('🔒 useAuth token check:', !!token);
                if (token) {
                    // You can decode token or get user info from localStorage
                    const userData = localStorage.getItem('user');
                    console.log('🔒 useAuth user data found:', !!userData);
                    if (userData) {
                        const parsedUser = JSON.parse(userData);
                        console.log('🔒 useAuth setting user:', parsedUser);
                        setUser(parsedUser);
                    } else {
                        // Set a default user object if no user data available
                        console.log('🔒 useAuth setting default user');
                        setUser({ name: 'User', email: '' });
                    }
                }
            } else {
                console.log('🔒 useAuth clearing user');
                setUser(null);
            }
            
            setLoading(false);
            console.log('🔒 useAuth check completed');
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
        setUser(null);
    };

    return {
        user,
        isAuthenticated,
        loading,
        login,
        logout
    };
};
