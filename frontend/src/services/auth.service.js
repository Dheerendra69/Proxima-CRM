import api from "./api";

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);

  localStorage.setItem("accessToken", response.data.accessToken);

  return response.data;
};

export const register = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("accessToken");
};
