import client from "./client";

export const getIssues = (repoId, params = {}) => client.get(`/repo/${repoId}/issues`, { params });
export const getIssueById = (repoId, issueId) => client.get(`/repo/${repoId}/issues/${issueId}`);
export const createIssue = (repoId, data) => client.post(`/repo/${repoId}/issues`, data);
export const updateIssue = (repoId, issueId, data) => client.patch(`/repo/${repoId}/issues/${issueId}`, data);
export const addIssueComment = (repoId, issueId, body) => client.post(`/repo/${repoId}/issues/${issueId}/comments`, { body });
export const deleteIssue = (repoId, issueId) => client.delete(`/repo/${repoId}/issues/${issueId}`);
