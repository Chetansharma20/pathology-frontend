import axiosClient from '../axiosClient';

// Get bill by ID
export const getBillById = async (billId) => {
    try {
        const response = await axiosClient.get(`/bills/${billId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching bill:', error);
        throw error;
    }
};

