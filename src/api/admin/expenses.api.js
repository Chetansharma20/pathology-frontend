import axiosClient from '../axiosClient';

// Get all expenses with filters (page, limit, startDate, endDate, category, etc.)
export const getExpenses = async (params = {}) => {
  try {
    const response = await axiosClient.get('/expense/all', { params });
    return response.data; // Expected: { data: [], pagination: {}, ... }
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const createExpense = async (expenseData) => {
  try {
    // expenseData is likely FormData for file upload
    const response = await axiosClient.post('/expense/add', expenseData);
    return response.data;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

// Batch create expenses (supports FormData or JSON)
export const createBatchExpenses = async (expensesData) => {
  try {
    // expensesData can be JSON object or FormData
    const response = await axiosClient.post('/expense/batch', expensesData);
    return response.data;
  } catch (error) {
    console.error('Error batch creating expenses:', error);
    throw error;
  }
};

export const updateExpense = async (expenseId, expenseData) => {
  try {
    const response = await axiosClient.put(`/expense/update/${expenseId}`, expenseData);
    return response.data;
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    const response = await axiosClient.delete(`/expense/delete/${expenseId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};
