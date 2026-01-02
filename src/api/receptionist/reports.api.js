import axiosClient from "../axiosClient";

export const assignTestsToPatient = async (data) => {
  try {
    const response = await axiosClient.post("/tests/createtestorder", data);
    return response;
  } catch (error) {
    console.error("Error assigning tests:", error);
    throw error;
  }
};

export const getReports = async () => {
  // ... existing empty functions if any are needed soon
};
