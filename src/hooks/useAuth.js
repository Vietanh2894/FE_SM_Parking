import { useState, useEffect } from 'react';
import authService from '../services/authService';

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
            
            // Get user info from localStorage based on userType
            if (authenticated) {
                const userType = localStorage.getItem('userType');
                console.log('🔒 useAuth user type:', userType);
                
                if (userType === 'USER') {
                    const userInfo = localStorage.getItem('userInfo');
                    if (userInfo) {
                        const parsedUser = JSON.parse(userInfo);
                        console.log('🔒 useAuth setting user info:', parsedUser);
                        setUser({
                            ...parsedUser,
                            type: 'USER'
                        });
                    }
                } else if (userType === 'STAFF') {
                    const staffInfo = localStorage.getItem('staffInfo');
                    if (staffInfo) {
                        const parsedStaff = JSON.parse(staffInfo);
                        console.log('🔒 useAuth setting staff info:', parsedStaff);
                        setUser({
                            id: parsedStaff.maNV,
                            name: parsedStaff.hoTen,
                            email: parsedStaff.email,
                            role: parsedStaff.chucVu,
                            type: 'STAFF'
                        });
                    }
                }
                
                // Fallback if no specific user data found
                if (!localStorage.getItem('userInfo') && !localStorage.getItem('staffInfo')) {
                    console.log('🔒 useAuth setting default user');
                    setUser({ 
                        name: authService.getLoggedInUserName(), 
                        type: userType || 'USER' 
                    });
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

    const login = async (credential, password) => {
        try {
            const result = await authService.login(credential, password);
            if (result.success) {
                setIsAuthenticated(true);
                
                // Set user info based on login result
                const { userType, userInfo, staffInfo } = result;
                if (userType === 'USER' && userInfo) {
                    setUser({
                        ...userInfo,
                        type: 'USER'
                    });
                } else if (userType === 'STAFF' && staffInfo) {
                    setUser({
                        id: staffInfo.maNV,
                        name: staffInfo.hoTen,
                        email: staffInfo.email,
                        role: staffInfo.chucVu,
                        type: 'STAFF'
                    });
                }
                
                return { success: true, userType, userInfo, staffInfo };
            } else {
                return { 
                    success: false, 
                    error: result.error || 'Login failed' 
                };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Login failed' 
            };
        }
    };

    const logout = async () => {
        try {
            await authService.performLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    return {
        user,
        isAuthenticated,
        loading,
        login,
        logout
    };
};
