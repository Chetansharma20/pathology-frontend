import axiosClient from '../axiosClient';

// Get revenue stats with optional pagination and filters
// Returns: { stats, data: revenues[], pagination }
export const getRevenueStats = async (params = {}) => {
    try {
        const response = await axiosClient.get('/revenue/stats', { params });
        return response;
    } catch (error) {
        console.error('Error fetching revenue stats:', error);
        throw error;
    }
};

export const getMonthlyRevenue = async (year) => {
    try {
        const response = await axiosClient.get('/revenue/monthly', { params: { year } });
        return response;
    } catch (error) {
        console.error('Error fetching monthly revenue:', error);
        throw error;
    }
};

export const getDailyRevenue = async (year, month) => {
    try {
        const response = await axiosClient.get('/revenue/daily', { params: { year, month } });
        return response;
    } catch (error) {
        console.error('Error fetching daily revenue:', error);
        throw error;
    }
};
