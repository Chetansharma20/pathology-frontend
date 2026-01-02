import axiosInstance from '../axiosInstance';

export const uploadHistoricalReport = async (formData) => {
    try {
        const response = await axiosInstance.post('/tests/add-report', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
