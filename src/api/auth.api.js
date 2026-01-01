import axiosClient from './axiosClient';

// Real Auth API
export const loginUser = async (username, password) => {
    try {
        // Backend expects { email, password } or similar?
        // Based on user.routes.js -> loginController, let's assume it accepts standard credentials.
        // It's safer to send 'email' if backend strictly wants email, or just pass what we have.
        // Usually loginController checks req.body.email or req.body.username.
        // Let's stick to the prompt's context: username/password passed from UI.
        const response = await axiosClient.post('/user/login', { email: username, password });
        return response; // response.data (intercepted) which contains { accessToken, user, ... }
    } catch (error) {
        console.error("Login API Error:", error);
        throw error; // Re-throw to be caught by AuthContext
    }
};

export const logoutUser = async () => {
    try {
        return await axiosClient.post('/user/logout');
    } catch (error) {
        console.error("Logout API Error:", error);
        // Even if API fails, we should clear local state in Context/UI
    }
};
