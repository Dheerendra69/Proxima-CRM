import api from "./api";

export const getActivityLogs = async () => {
  const response = await api.get("/activity-log");
  return response.data;
};
