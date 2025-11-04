// services/api.js (FIXED: Removing deprecated methods and local storage usage)

// 💡 CRITICAL FIX: Explicitly target the Node.js backend port (e.g., 5000)
const API_BASE_URL = "http://localhost:5000/api" 

// Helper function to handle authentication header
const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken"); // Use 'token' or 'authToken'
    return {
        Authorization: `Bearer ${token}`,
    }
}

// Helper function to handle JSON request headers
const getJsonHeaders = () => ({
    "Content-Type": "application/json",
})

// Helper function to get headers with auth for JSON requests
const getAuthJsonHeaders = () => ({
    ...getJsonHeaders(),
    ...getAuthHeaders(),
})

const api = {
    // --- Auth endpoints (unchanged) ---
    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: getJsonHeaders(),
            body: JSON.stringify(userData),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Registration failed")
        }

        return response.json()
    },

    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: getJsonHeaders(),
            body: JSON.stringify(credentials),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Login failed")
        }

        return response.json()
    },

    getProfile: async () => {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error("Failed to fetch profile")
        }

        return response.json()
    },

    // ------------------------------------
    // --- Analysis endpoints (Refactored to new flow) ---
    // ------------------------------------

    /**
     * @deprecated The backend route for this has been removed. Use analyzeJob and analyzeResume instead.
     */
    uploadFiles: async (formData) => {
        throw new Error("uploadFiles is deprecated. Use analyzeJob and analyzeResume.");
    },
    
    /**
     * 🟢 Fetches the Job Profile by ID. Maps to GET /api/analysis/job/:jobId
     * @param {string} jobId - The unique ID of the job profile to fetch.
     * @returns {Object} - Expected: { success: true, jobProfile: {...} }
     */
    getJobProfile: async (jobId) => {
        const response = await fetch(`${API_BASE_URL}/analysis/job/${jobId}`, {
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            const error = data.message || 'Failed to fetch Job Profile.';
            throw new Error(error);
        }

        return data; // Returns { jobProfile, ... }
    },

    /**
     * 🎯 NEW FUNCTION (STEP 1): Uploads and analyzes the Job Description.
     * Maps to POST /api/analysis/job.
     * @param {FormData} formData - Must contain the 'jobDescription' file.
     * @returns {Object} - Expected: { success: true, jobId: '...', jobProfile: {...} }
     */
    analyzeJob: async (formData) => {
        const response = await fetch(`${API_BASE_URL}/analysis/job`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            const error = data.error || data.message || 'Failed to analyze Job Description.';
            throw new Error(error);
        }

        return data; // Returns { jobId, jobProfile, ... }
    },

    /**
     * 🎯 NEW FUNCTION (STEP 2): Analyzes the resume against a JD.
     * Maps to POST /api/analysis/resume.
     * @param {FormData} formData - Must contain the 'resume' file AND the 'jobId' (as a text field).
     * @returns {Object} - Expected: { success: true, analysisId: '...', candidates: [...] }
     */
    analyzeResume: async (formData) => {
        const response = await fetch(`${API_BASE_URL}/analysis/resume`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            const error = data.error || data.message || 'Failed to analyze resume and match against JD.';
            throw new Error(error);
        }

        // The backend returns { success: true, analysisId, candidates: [candidateData] }
        return data; 
    },
    
    /**
     * 🎯 FIXED: Retrieves the dynamic match results from the backend.
     */
    getAnalysisResults: async (analysisId) => {
        // Now relying solely on the implemented backend endpoint for dynamic data
        const response = await fetch(`${API_BASE_URL}/analysis/results/${analysisId}`, {
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch results.")
        }

        return response.json()
    },

    // --- Candidates endpoints (unchanged) ---
    getCandidates: async () => {
        const response = await fetch(`${API_BASE_URL}/candidates`, {
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error("Failed to fetch candidates")
        }

        return response.json()
    },

    getCandidateDetails: async (candidateId) => {
        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error("Failed to fetch candidate details")
        }

        return response.json()
    },

    // --- Contact endpoints (UPDATED with new MongoDB functionality) ---
    
    /**
     * Submit contact form (with rate limiting)
     * Maps to POST /api/contact
     * @param {Object} contactData - { name, email, subject, message }
     * @returns {Object} - { message: string, messageId: string, timestamp: Date }
     */
    submitContact: async (contactData) => {
        const response = await fetch(`${API_BASE_URL}/contact`, {
            method: "POST",
            headers: getJsonHeaders(),
            body: JSON.stringify(contactData),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to send message")
        }

        return response.json()
    },

    /**
     * 🆕 Get all contact submissions (admin only)
     * Maps to GET /api/contact/submissions
     * @param {number} page - Page number (default: 1)
     * @param {number} limit - Items per page (default: 10)
     * @param {string} status - Filter by status: 'new', 'in-progress', 'resolved'
     * @returns {Object} - { data: { submissions, totalPages, currentPage, total } }
     */
    getContactSubmissions: async (page = 1, limit = 10, status = '') => {
        const params = new URLSearchParams({ page, limit });
        if (status) params.append('status', status);
        
        const response = await fetch(`${API_BASE_URL}/contact/submissions?${params}`, {
            headers: getAuthJsonHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch contact submissions");
        }

        return response.json();
    },

    /**
     * 🆕 Get single contact submission (admin only)
     * Maps to GET /api/contact/submissions/:id
     * @param {string} submissionId - MongoDB submission ID
     * @returns {Object} - { data: submission }
     */
    getContactSubmission: async (submissionId) => {
        const response = await fetch(`${API_BASE_URL}/contact/submissions/${submissionId}`, {
            headers: getAuthJsonHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch contact submission");
        }

        return response.json();
    },

    /**
     * 🆕 Update contact submission status (admin only)
     * Maps to PATCH /api/contact/submissions/:id
     * @param {string} submissionId - MongoDB submission ID
     * @param {Object} updateData - { status, priority, adminNotes }
     * @returns {Object} - { data: updatedSubmission }
     */
    updateContactSubmission: async (submissionId, updateData) => {
        const response = await fetch(`${API_BASE_URL}/contact/submissions/${submissionId}`, {
            method: "PATCH",
            headers: getAuthJsonHeaders(),
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to update contact submission");
        }

        return response.json();
    },

    /**
     * 🆕 Get contact statistics (admin only)
     * Maps to GET /api/contact/statistics
     * @returns {Object} - { data: { total, new, inProgress, resolved, recent } }
     */
    getContactStatistics: async () => {
        const response = await fetch(`${API_BASE_URL}/contact/statistics`, {
            headers: getAuthJsonHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch contact statistics");
        }

        return response.json();
    },
}

export default api