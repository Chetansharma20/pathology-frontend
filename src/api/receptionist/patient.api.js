import axiosInstance from '../axiosInstance';

// Get all patients (lab-wise)
export const getPatients = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/patient/getallpatient', { params });
    // Backend returns:
    // { statusCode, data: { patients: [...], pagination: { currentPage, totalPages, totalRecords, recordsPerPage, ... } }, message, success }
    const apiResponse = response.data;
    if (apiResponse && apiResponse.success) {
      const { patients, pagination } = apiResponse.data || {};
      return {
        data: patients || [],
        total: pagination?.totalRecords || 0,
        totalPages: pagination?.totalPages || 1,
        page: pagination?.currentPage || params.page || 1,
        limit: pagination?.recordsPerPage || params.limit || 10,
        hasNextPage: pagination?.hasNextPage || false,
        hasPrevPage: pagination?.hasPrevPage || false
      };
    } else {
      throw new Error(apiResponse?.message || 'Failed to fetch patients');
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

// Register patient
export const createPatient = async (patientData) => {
  try {
    const response = await axiosInstance.post('/patient/add', patientData);
    return response.data;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
};

// Search patient
export const searchPatient = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/patient/search', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching patient:', error);
    throw error;
  }
};

// Patient profile
export const getPatientById = async (id) => {
  try {
    const response = await axiosInstance.get(`/patient/getpatientbyid/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient by ID:', error);
    throw error;
  }
};

// Update patient
export const updatePatient = async (id, patientData) => {
  try {
    const response = await axiosInstance.put(`/patient/updatepatient/${id}`, patientData);
    return response.data;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

// Get daily patients for a specific month/year
export const getDailyPatient = async (year, month) => {
  try {
    const response = await axiosInstance.get('/patient/daily', {
      params: { year, month }
    });
    // Backend returns { statusCode, data: [...], message, success }
    const apiResponse = response.data;
    if (apiResponse && apiResponse.success) {
      return apiResponse.data || [];
    } else {
      throw new Error(apiResponse?.message || 'Failed to fetch daily patients');
    }
  } catch (error) {
    console.error('Error fetching daily patients:', error);
    throw error;
  }
};

// Delete patient (Keeping this if needed, though not in the provided routes list)
export const deletePatient = async (patientId) => {
  try {
    const response = await axiosInstance.delete(`/patient/${patientId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
};
