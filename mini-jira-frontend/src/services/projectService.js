import api from '../api/axios';

const getProjects = async (params) => {
    const response = await api.get('/projects/all', { params });
    return response.data;
};

const createProject = async (projectData) => {
    const response = await api.post('/projects/create', projectData);
    return response.data;
};

const updateProject = async (projectId, projectData) => {
    const response = await api.put(`/projects/update?projectId=${projectId}`, projectData);
    return response.data;
};

const deleteProject = async (projectId) => {
    const response = await api.delete(`/projects/delete?projectId=${projectId}`);
    return response.data;
};

const projectService = {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
};

export default projectService;
