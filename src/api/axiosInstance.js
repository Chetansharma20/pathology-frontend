import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api', // Update this if your backend URL is different
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const savedUser = localStorage.getItem('digitos-user');
        if (savedUser) {
            try {
                const { token } = JSON.parse(savedUser);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Error parsing user token from localStorage', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle common errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Temporarily disabled to allow bypassing login with mock token
        // if (error.response && error.response.status === 401) {
        //     if (window.location.pathname !== '/login') {
        //         console.error('Unauthorized access - redirecting to login');
        //         localStorage.removeItem('digitos-user');
        //         window.location.href = '/login';
        //     }
        // }
        return Promise.reject(error);
    }
);

export default axiosInstance;
