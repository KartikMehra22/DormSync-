import axios from 'axios';

const BASE_URL = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_BACKEND_SERVER_URL
    : process.env.NEXT_PUBLIC_BACKEND_LOCAL_URL;

// Helper to get auth headers
const getAuthHeaders = (token) => ({
    headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    },
});

// ==================== AUTHENTICATION ====================
export const authAPI = {
    login: async (credentials) => {
        const res = await axios.post(`${BASE_URL}/api/auth/login`, credentials);
        return res.data;
    },

    register: async (userData) => {
        const res = await axios.post(`${BASE_URL}/api/auth/register`, userData);
        return res.data;
    },

    getMe: async (token) => {
        const res = await axios.get(`${BASE_URL}/api/auth/me`, getAuthHeaders(token));
        return res.data;
    },

    updateProfile: async (token, data) => {
        const res = await axios.put(`${BASE_URL}/api/auth/update`, data, getAuthHeaders(token));
        return res.data;
    },

    addStudent: async (token, data) => {
        const res = await axios.post(`${BASE_URL}/api/auth/add-student`, data, getAuthHeaders(token));
        return res.data;
    },
};

// ==================== PROFILE ====================
export const profileAPI = {
    getProfile: async (token) => {
        const res = await axios.get(`${BASE_URL}/api/profile/me`, getAuthHeaders(token));
        return res.data;
    },

    updateProfile: async (token, data) => {
        const res = await axios.put(`${BASE_URL}/api/profile/update`, data, getAuthHeaders(token));
        return res.data;
    },
};

// ==================== ROOMS ====================
export const roomAPI = {
    // Blocks
    getAllBlocks: async () => {
        const res = await axios.get(`${BASE_URL}/api/rooms/blocks`);
        return res.data;
    },

    createBlock: async (token, data) => {
        const res = await axios.post(`${BASE_URL}/api/rooms/blocks`, data, getAuthHeaders(token));
        return res.data;
    },

    // Rooms
    getAllRooms: async (params = {}) => {
        const res = await axios.get(`${BASE_URL}/api/rooms/rooms`, { params });
        return res.data;
    },

    getRoom: async (id) => {
        const res = await axios.get(`${BASE_URL}/api/rooms/rooms/${id}`);
        return res.data;
    },

    createRoom: async (token, data) => {
        const res = await axios.post(`${BASE_URL}/api/rooms/rooms`, data, getAuthHeaders(token));
        return res.data;
    },

    // Allocations
    getMyRoom: async (token) => {
        try {
            const res = await axios.get(`${BASE_URL}/api/rooms/allocations/my-room`, getAuthHeaders(token));
            return res.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return { allocation: null };
            }
            throw error;
        }
    },

    getAllAllocations: async (token) => {
        const res = await axios.get(`${BASE_URL}/api/rooms/allocations`, getAuthHeaders(token));
        return res.data;
    },

    allocateRoom: async (token, data) => {
        const res = await axios.post(`${BASE_URL}/api/rooms/allocations`, data, getAuthHeaders(token));
        return res.data;
    },

    vacateRoom: async (token, id) => {
        const res = await axios.put(`${BASE_URL}/api/rooms/allocations/${id}/vacate`, {}, getAuthHeaders(token));
        return res.data;
    },

    // Requests
    getMyRequests: async (token) => {
        const res = await axios.get(`${BASE_URL}/api/rooms/requests/my-requests`, getAuthHeaders(token));
        return res.data;
    },

    createRequest: async (token, data) => {
        const res = await axios.post(`${BASE_URL}/api/rooms/requests`, data, getAuthHeaders(token));
        return res.data;
    },

    getAllRequests: async (token) => {
        const res = await axios.get(`${BASE_URL}/api/rooms/requests`, getAuthHeaders(token));
        return res.data;
    },

    approveRequest: async (token, id, remarks) => {
        const res = await axios.put(`${BASE_URL}/api/rooms/requests/${id}/approve`, { remarks }, getAuthHeaders(token));
        return res.data;
    },

    rejectRequest: async (token, id, remarks) => {
        const res = await axios.put(`${BASE_URL}/api/rooms/requests/${id}/reject`, { remarks }, getAuthHeaders(token));
        return res.data;
    },
};

// ==================== ATTENDANCE ====================
export const attendanceAPI = {
    checkIn: async (token) => {
        const res = await axios.post(`${BASE_URL}/api/attendance/check-in`, {}, getAuthHeaders(token));
        return res.data;
    },

    getMyAttendance: async (token, params = {}) => {
        const res = await axios.get(`${BASE_URL}/api/attendance/my-attendance`, {
            ...getAuthHeaders(token),
            params,
        });
        return res.data;
    },

    getAllAttendance: async (token, params = {}) => {
        const res = await axios.get(`${BASE_URL}/api/attendance`, {
            ...getAuthHeaders(token),
            params,
        });
        return res.data;
    },

    markAttendance: async (token, data) => {
        const res = await axios.post(`${BASE_URL}/api/attendance/mark`, data, getAuthHeaders(token));
        return res.data;
    },

    getReports: async (token, params = {}) => {
        const res = await axios.get(`${BASE_URL}/api/attendance/reports`, {
            ...getAuthHeaders(token),
            params,
        });
        return res.data;
    },
};

// ==================== MESS ====================
export const messAPI = {
    getMenu: async (params) => {
        const res = await axios.get(`${BASE_URL}/api/mess/menu`, { params });
        return res.data;
    },

    createMenu: async (token, data) => {
        const res = await axios.post(`${BASE_URL}/api/mess/menu`, data, getAuthHeaders(token));
        return res.data;
    },

    optOut: async (token, data) => {
        const res = await axios.post(`${BASE_URL}/api/mess/opt-out`, data, getAuthHeaders(token));
        return res.data;
    },

    cancelOptOut: async (token, id) => {
        const res = await axios.delete(`${BASE_URL}/api/mess/opt-out/${id}`, getAuthHeaders(token));
        return res.data;
    },

    getMyOptOuts: async (token, params = {}) => {
        const res = await axios.get(`${BASE_URL}/api/mess/my-opt-outs`, {
            ...getAuthHeaders(token),
            params,
        });
        return res.data;
    },

    getAllOptOuts: async (token, params = {}) => {
        const res = await axios.get(`${BASE_URL}/api/mess/opt-outs`, {
            ...getAuthHeaders(token),
            params,
        });
        return res.data;
    },

    getCredits: async (token) => {
        const res = await axios.get(`${BASE_URL}/api/mess/credits`, getAuthHeaders(token));
        return res.data;
    },
};

// ==================== ISSUES ====================
export const issueAPI = {
    createIssue: async (token, data) => {
        const res = await axios.post(`${BASE_URL}/api/issues`, data, getAuthHeaders(token));
        return res.data;
    },

    getMyIssues: async (token, params = {}) => {
        const res = await axios.get(`${BASE_URL}/api/issues/my-issues`, {
            ...getAuthHeaders(token),
            params,
        });
        return res.data;
    },

    getAllIssues: async (token, params = {}) => {
        const res = await axios.get(`${BASE_URL}/api/issues`, {
            ...getAuthHeaders(token),
            params,
        });
        return res.data;
    },

    getIssue: async (token, id) => {
        const res = await axios.get(`${BASE_URL}/api/issues/${id}`, getAuthHeaders(token));
        return res.data;
    },

    updateStatus: async (token, id, data) => {
        const res = await axios.put(`${BASE_URL}/api/issues/${id}/status`, data, getAuthHeaders(token));
        return res.data;
    },

    resolveIssue: async (token, id, remarks) => {
        const res = await axios.put(`${BASE_URL}/api/issues/${id}/resolve`, { remarks }, getAuthHeaders(token));
        return res.data;
    },
};

// ==================== ANNOUNCEMENTS ====================
export const announcementAPI = {
    getAll: async (params = {}) => {
        const res = await axios.get(`${BASE_URL}/api/announcements`, { params });
        return res.data;
    },

    getAnnouncement: async (id) => {
        const res = await axios.get(`${BASE_URL}/api/announcements/${id}`);
        return res.data;
    },

    create: async (token, data) => {
        const res = await axios.post(`${BASE_URL}/api/announcements`, data, getAuthHeaders(token));
        return res.data;
    },

    update: async (token, id, data) => {
        const res = await axios.put(`${BASE_URL}/api/announcements/${id}`, data, getAuthHeaders(token));
        return res.data;
    },

    delete: async (token, id) => {
        const res = await axios.delete(`${BASE_URL}/api/announcements/${id}`, getAuthHeaders(token));
        return res.data;
    },
};

// ==================== MESS SUGGESTIONS ====================
export const messSuggestionAPI = {
    create: async (token, data) => {
        const res = await axios.post(`${BASE_URL}/api/mess-suggestions`, data, getAuthHeaders(token));
        return res.data;
    },

    getAll: async (token, params = {}) => {
        const res = await axios.get(`${BASE_URL}/api/mess-suggestions`, {
            ...getAuthHeaders(token),
            params,
        });
        return res.data;
    },

    vote: async (token, id) => {
        const res = await axios.post(`${BASE_URL}/api/mess-suggestions/${id}/vote`, {}, getAuthHeaders(token));
        return res.data;
    },

    updateStatus: async (token, id, status) => {
        const res = await axios.put(`${BASE_URL}/api/mess-suggestions/${id}/status`, { status }, getAuthHeaders(token));
        return res.data;
    },

    delete: async (token, id) => {
        const res = await axios.delete(`${BASE_URL}/api/mess-suggestions/${id}`, getAuthHeaders(token));
        return res.data;
    },
};

export default {
    auth: authAPI,
    profile: profileAPI,
    room: roomAPI,
    attendance: attendanceAPI,
    mess: messAPI,
    messSuggestion: messSuggestionAPI,
    issue: issueAPI,
    announcement: announcementAPI,
};
