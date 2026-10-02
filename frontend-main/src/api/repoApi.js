import client from "./client";

export const getRepos = () => client.get("/repo/all");
export const getUserRepos = (userId) => client.get(`/repo/user/${userId}`);
export const getRepoById = (id) => client.get(`/repo/${id}`);
export const createRepo = (data) => client.post("/repo/create", data);
export const updateRepo = (id, data) => client.put(`/repo/update/${id}`, data);
export const deleteRepo = (id) => client.delete(`/repo/delete/${id}`);
export const toggleVisibility = (id) => client.patch(`/repo/toggle/${id}`);
