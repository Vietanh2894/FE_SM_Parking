// Utility function to clean user data before sending to API
export const cleanUserData = (userData) => {
    const cleanData = {
        name: userData.name,
        email: userData.email
    };
    
    // Only include password if it's provided and not empty
    if (userData.password && userData.password.trim() !== '') {
        cleanData.password = userData.password;
    }
    
    return cleanData;
};

// Utility function to validate email format
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Utility function to format date
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

// Utility function to capitalize first letter
export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
