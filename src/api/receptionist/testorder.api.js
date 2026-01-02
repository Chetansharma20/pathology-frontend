import axiosInstance from '../axiosInstance';

// Create a test order
export const createTestOrder = async (orderData) => {
    try {
        const response = await axiosInstance.post('tests/createtestorder', orderData);
        const apiResponse = response.data;
        if (apiResponse && apiResponse.success !== false) {
            return apiResponse.data || apiResponse;
        } else {
            throw new Error(apiResponse?.message || 'Failed to create test order');
        }
    } catch (error) {
        console.error('Error creating test order:', error);
        throw error;
    }
};

// Get all doctors for selection
export const getDoctors = async () => {
    try {
        const response = await axiosInstance.get('/doctor/all');
        const apiResponse = response.data;
        if (apiResponse && apiResponse.success !== false) {
            return apiResponse.data || [];
        } else {
            throw new Error(apiResponse?.message || 'Failed to fetch doctors');
        }
    } catch (error) {
        console.error('Error fetching doctors:', error);
        throw error;
    }
};

// Get all pending test orders
export const getPendingOrders = async () => {
    try {
        const response = await axiosInstance.get('/tests/pending');
        const apiResponse = response.data;
        if (apiResponse && apiResponse.success !== false) {
            return apiResponse.data || [];
        } else {
            throw new Error(apiResponse?.message || 'Failed to fetch pending orders');
        }
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        throw error;
    }
};

// Submit test result
export const submitTestResult = async (orderId, testItemId, resultData) => {
    try {
        const response = await axiosInstance.put(`tests/result/${orderId}/${testItemId}`, resultData);
        const apiResponse = response.data;
        if (apiResponse && apiResponse.success !== false) {
            return apiResponse.data || apiResponse;
        } else {
            throw new Error(apiResponse?.message || 'Failed to submit test result');
        }
    } catch (error) {
        console.error('Error submitting test result:', error);
        throw error;
    }
};

// Get patient test history
export const getPatientTestHistory = async (patientId) => {
    try {
        const response = await axiosInstance.get(`/tests/patient/${patientId}`);
        const apiResponse = response.data;
        if (apiResponse && apiResponse.success !== false) {
            return apiResponse.data || { orders: [], reports: [] };
        } else {
            throw new Error(apiResponse?.message || 'Failed to fetch patient history');
        }
    } catch (error) {
        console.error('Error fetching patient history:', error);
        throw error;
    }
};

// Finalize test order (Generate Report)
export const finalizeTestOrder = async (orderId) => {
    try {
        const response = await axiosInstance.get(`/tests/finalize/${orderId}`);
        const apiResponse = response.data;
        if (apiResponse && apiResponse.success !== false) {
            return apiResponse.data || apiResponse;
        } else {
            throw new Error(apiResponse?.message || 'Failed to finalize order');
        }
    } catch (error) {
        console.error('Error finalizing order:', error);
        throw error;
    }
};

// Download test report PDF
export const downloadTestReport = async (orderId) => {
    try {
        const response = await axiosInstance.get(`/tests/${orderId}/download`, {
            responseType: 'blob' // Important for file download
        });
        return response.data;
    } catch (error) {
        console.error('Error downloading report:', error);
        throw error;
    }
};

// Get Patient Reports (Completed)
export const getPatientReports = async (patientId) => {
    try {
        const response = await axiosInstance.get(`/tests/patient/${patientId}/reports`);
        const apiResponse = response.data;
        if (apiResponse && apiResponse.success !== false) {
            return apiResponse.data || [];
        } else {
            throw new Error(apiResponse?.message || 'Failed to fetch patient reports');
        }
    } catch (error) {
        console.error('Error fetching patient reports:', error);
        throw error;
    }
};
// Submit bulk results by bill
export const submitBulkResultsByBill = async (billId, resultData) => {
    try {
        const response = await axiosInstance.put(`tests/bill/${billId}/submit`, resultData);
        const apiResponse = response.data;
        if (apiResponse && apiResponse.success !== false) {
            return apiResponse.data || apiResponse;
        } else {
            throw new Error(apiResponse?.message || 'Failed to submit bulk results');
        }
    } catch (error) {
        console.error('Error submitting bulk results:', error);
        throw error;
    }
};

// Send Report Via Email
export const sendReportEmail = async (patientId) => {
    try {
        const response = await axiosInstance.get(`/tests/send-report/${patientId}`);
        const apiResponse = response.data;
        if (apiResponse && apiResponse.success !== false) {
            return apiResponse.data || apiResponse;
        } else {
            throw new Error(apiResponse?.message || 'Failed to send report email');
        }
    } catch (error) {
        console.error('Error sending report email:', error);
        throw error;
    }
};
