import axiosClient from '../axiosClient';

// Get revenue stats with optional pagination and filters
// Returns: { stats, data: revenues[], pagination }
export const getRevenueStats = async (params = {}) => {
    try {
        const response = await axiosClient.get('/revenue/stats', { params });
        console.log(response);
        return response;
    } catch (error) {
        console.error('Error fetching revenue stats:', error);
        throw error;
    }
};

export const getRevenueAnalytics = async (year, month) => {
    try {
        const response = await axiosClient.get('/revenue/analytics', { params: { year, month } });
        return response; // Expected: { yearlyTotal: {}, monthly: [], daily: [] }
    } catch (error) {
        console.error('Error fetching revenue analytics:', error);
        throw error;
    }
};
