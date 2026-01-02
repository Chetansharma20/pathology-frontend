import axiosInstance from '../axiosInstance';

export const getDoctors = async () => {
  try {
    const response = await axiosInstance.get('/doctors/all');
    const apiResponse = response.data;
    if (apiResponse && apiResponse.success) {
      return apiResponse.data || [];
    } else {
      throw new Error(apiResponse?.message || 'Failed to fetch doctors');
    }
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

export const createDoctor = async (doctorData) => {
  try {
    const response = await axiosInstance.post('/doctors/add', doctorData);
    return response.data;
  } catch (error) {
    console.error('Error creating doctor:', error);
    throw error;
  }
};

export const updateDoctor = async (doctorId, doctorData) => {
  try {
    const response = await axiosInstance.put(`/doctors/update/${doctorId}`, doctorData);
    return response.data;
  } catch (error) {
    console.error('Error updating doctor:', error);
    throw error;
  }
};

export const deleteDoctor = async (doctorId) => {
  try {
    const response = await axiosInstance.delete(`/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting doctor:', error);
    throw error;
  }
};
