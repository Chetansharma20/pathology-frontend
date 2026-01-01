import axiosClient from '../axiosClient';

export const getPatients = async (params = {}) => {
  try {
    // Backend: /patient/getallpatient
    // Supports query params: page, limit, search, etc.
    const response = await axiosClient.get('/patient/getallpatient', { params });
    // response is the backend body.
    // Backend returns: { statusCode: 200, data: { patients: [], pagination: {} }, ... }
    return response;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

export const createPatient = async (patientData) => {
  try {
    const response = await axiosClient.post('/patient/add', patientData);
    return response;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
};

export const updatePatient = async (patientId, patientData) => {
  try {
    const response = await axiosClient.put(`/patient/updatepatient/${patientId}`, patientData);
    return response;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

export const deletePatient = async (patientId) => {
  try {
    // Backend didn't seem to have a dedicated delete route in the list?
    // Checked routes/patient.routes.js:
    // routes: add, getallpatient, search, getpatientbyid, updatepatient, daily.
    // NO DELETE ROUTE VISIBLE!
    // We will throw error or structure it as not implemented for now to avoid crashes.
    console.warn("Delete Patient endpoint not found in backend routes.");
    throw new Error("Delete operation not supported by backend yet.");
    /*
    const response = await axiosClient.delete(`/patient/${patientId}`);
    return response;
    */
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
};
