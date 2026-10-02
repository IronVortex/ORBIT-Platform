import client from "./client";

export const getUser = (userId) => client.get(`/userProfile/${userId}`);
export const updateUser = (userId, data) => client.patch(`/userProfile/${userId}`, data);
export const getAllUsers = () => client.get("/users");
