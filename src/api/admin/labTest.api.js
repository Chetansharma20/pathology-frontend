import axiosInstance from '../axiosInstance';

export const getLabTests = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/tests/gettests', { params });
    const apiResponse = response.data;
    if (apiResponse && apiResponse.success) {
      // Backend returns { success: true, data: [...], message: "..." }
      // We need to format it to match what the frontend expects (data, total, etc.)
      // Assuming the backend just returns an array in data for now based on the controller name getAllTests
      // If pagination is added later, we adjust. For now, wrap the array.
      return {
        data: apiResponse.data || [],
        total: apiResponse.data?.length || 0,
        totalPages: 1,
        page: 1,
        limit: apiResponse.data?.length || 10
      };
    } else {
      throw new Error(apiResponse?.message || 'Failed to fetch lab tests');
    }
  } catch (error) {
    console.error('Error fetching lab tests:', error);
    throw error;
  }
};

export const createLabTest = async (testData) => {
  try {
    const response = await axiosInstance.post('/tests/createtest', testData);
    return response.data;
  } catch (error) {
    console.error('Error creating lab test:', error);
    throw error;
  }
};

export const updateLabTest = async (testId, testData) => {
  try {
    const response = await axiosInstance.put(`/tests/updatetest/${testId}`, testData);
    return response.data;
  } catch (error) {
    console.error('Error updating lab test:', error);
    throw error;
  }
};

export const deleteLabTest = async (testId) => {
  try {
    const response = await axiosInstance.delete(`/tests/${testId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting lab test:', error);
    throw error;
  }
};
