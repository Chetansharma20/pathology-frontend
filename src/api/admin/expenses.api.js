import axiosInstance from '../axiosInstance';

export const getExpenses = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/expenses/all', { params });
    const apiResponse = response.data;
    if (apiResponse && apiResponse.success) {
      // Backend returns { success: true, data: [...], message: "..." }
      // We need to format it to match what the frontend expects (data, total, etc.)
      return {
        data: apiResponse.data || [],
        total: apiResponse.data?.length || 0,
        totalPages: 1,
        page: 1,
        limit: apiResponse.data?.length || 10
      };
    } else {
      throw new Error(apiResponse?.message || 'Failed to fetch expenses');
    }
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const createExpense = async (expenseData) => {
  try {
    const response = await axiosInstance.post('/expenses/add', expenseData);
    return response.data;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

export const updateExpense = async (expenseId, expenseData) => {
  try {
    const response = await axiosInstance.put(`/expenses/update/${expenseId}`, expenseData);
    return response.data;
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    const response = await axiosInstance.delete(`/expenses/delete/${expenseId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};
