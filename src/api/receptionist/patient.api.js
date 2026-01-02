import axiosClient from "../axiosClient";

export const getPatients = async (params = {}) => {
  try {
    // Backend: /patient/getallpatient
    // Supports query params: page, limit, search, etc.
    const response = await axiosClient.get("/patient/getallpatient", {
      params,
    });
    // response is the backend body.
    // Backend returns: { statusCode: 200, data: { patients: [], pagination: {} }, ... }
    return response;
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
};

export const createPatient = async (patientData) => {
  try {
    const response = await axiosClient.post("/patient/add", patientData);
    return response;
  } catch (error) {
    console.error("Error creating patient:", error);
    throw error;
  }
};

export const updatePatient = async (patientId, patientData) => {
  try {
    const response = await axiosClient.put(
      `/patient/updatepatient/${patientId}`,
      patientData
    );
    return response;
  } catch (error) {
    console.error("Error updating patient:", error);
    throw error;
  }
};

export const deletePatient = async (patientId) => {
  try {
    const response = await axiosClient.delete(
      `/patient/deletepatient/${patientId}`
    );
    return response;
  } catch (error) {
    console.error("Error deleting patient:", error);
    throw error;
  }
};

export const getTodayPatients = async () => {
  try {
    const response = await axiosClient.get("/patient/today");
    return response;
  } catch (error) {
    console.error("Error fetching today's patients:", error);
    throw error;
  }
};

export const getPatientById = async (id) => {
  try {
    const response = await axiosClient.get(`/patient/getpatientbyid/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching patient details:", error);
    throw error;
  }
};
