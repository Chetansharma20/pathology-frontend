import axiosClient from '../axiosClient';

export const getDoctors = async () => {
  try {
    const response = await axiosClient.get('/doctor/all');
    // Backend returns: { statusCode: 200, data: [...], message: "..." }
    // axiosClient intercepts and returns response.data directly if configured that way?
    // Let's check axiosClient.js: "return response.data; // Unpack data directly"
    // So 'response' here is the JSON body from backend.
    // Backend ApiResponse has 'data' field.
    return response;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

export const createDoctor = async (doctorData) => {
  try {
    const response = await axiosClient.post('/doctor/add', doctorData);
    return response;
  } catch (error) {
    console.error('Error creating doctor:', error);
    throw error;
  }
};

export const updateDoctor = async (doctorId, doctorData) => {
  try {
    const response = await axiosClient.put(`/doctor/update/${doctorId}`, doctorData);
    return response;
  } catch (error) {
    console.error('Error updating doctor:', error);
    throw error;
  }
};

export const deleteDoctor = async (doctorId) => {
  try {
    const response = await axiosClient.delete(`/doctor/${doctorId}`);
    return response; // Usually { success: true, ... }
  } catch (error) {
    console.error('Error deleting doctor:', error);
    throw error;
  }
};
