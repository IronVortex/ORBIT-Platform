import client from "./client";

export const getRepoStatus = (repoId) => client.get(`/repo/${repoId}/status`);
export const getBranches = (repoId) => client.get(`/repo/${repoId}/branches`);
export const createBranch = (repoId, name, from) => client.post(`/repo/${repoId}/branches`, { name, from });
export const deleteBranch = (repoId, branch) => client.delete(`/repo/${repoId}/branches/${branch}`);
export const getCommits = (repoId, branch, limit = 30) => client.get(`/repo/${repoId}/commits/${branch}`, { params: { limit } });
export const getCommitDetail = (repoId, branch, hash) => client.get(`/repo/${repoId}/commits/${branch}/${hash}`);
export const getTree = (repoId, branch, path = "") => {
  const url = path ? `/repo/${repoId}/tree/${branch}/${path}` : `/repo/${repoId}/tree/${branch}`;
  return client.get(url);
};
export const getBlob = (repoId, branch, filePath) => client.get(`/repo/${repoId}/blob/${branch}/${filePath}`);
export const getReadme = (repoId, branch) => client.get(`/repo/${repoId}/readme/${branch}`);
export const getDiff = (repoId, base, head) => client.get(`/repo/${repoId}/diff/${base}/${head}`);
