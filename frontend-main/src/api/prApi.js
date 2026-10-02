import client from "./client";

export const getPRs = (repoId, params = {}) => client.get(`/repo/${repoId}/pulls`, { params });
export const getPRById = (repoId, prId) => client.get(`/repo/${repoId}/pulls/${prId}`);
export const getPRDiff = (repoId, prId) => client.get(`/repo/${repoId}/pulls/${prId}/diff`);
export const createPR = (repoId, data) => client.post(`/repo/${repoId}/pulls`, data);
export const updatePR = (repoId, prId, data) => client.patch(`/repo/${repoId}/pulls/${prId}`, data);
export const mergePR = (repoId, prId) => client.post(`/repo/${repoId}/pulls/${prId}/merge`);
export const submitReview = (repoId, prId, data) => client.post(`/repo/${repoId}/pulls/${prId}/review`, data);
export const addPRComment = (repoId, prId, body) => client.post(`/repo/${repoId}/pulls/${prId}/comments`, { body });
