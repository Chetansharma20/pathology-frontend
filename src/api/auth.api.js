import axiosInstance from './axiosInstance';

/**
 * Normalizes the user data from the backend response to match frontend expectations.
 * @param {Object} data - The data object from ApiResponse
 * @returns {Object} Normalized user data
 */
const normalizeUserData = (data) => {
    const { user, token, lab } = data;

    // Normalize role: ADMIN -> Admin, OPERATOR -> Operator
    const normalizedRole = user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();

    return {
        ...user,
        role: normalizedRole,
        token,
        labId: lab?._id,
        labInfo: lab
    };
};

export const loginUser = async (email, password) => {
    try {
        const response = await axiosInstance.post('/user/login', { email, password });

        // The backend returns { data: { token, user, lab }, message, success, errors }
        if (response.data && response.data.success) {
            return normalizeUserData(response.data.data);
        } else {
            throw new Error(response.data?.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login API error:', error);
        // Extract message from axios error if available
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred during login';
        throw new Error(message);
    }
};

export const logoutUser = async () => {
    // If the backend has a logout route, call it here.
    // Otherwise, just clear local state (handled in AuthContext).
    return Promise.resolve();
};
