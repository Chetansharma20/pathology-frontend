import axiosClient from '../axiosClient';

export const uploadHistoricalReport = async (formData) => {
    try {
        const response = await axiosClient.post('/tests/add-report', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

