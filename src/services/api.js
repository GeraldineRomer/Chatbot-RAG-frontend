import axios from 'axios';

// connect with deploy backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Storage key used to persist the multi-tenant session identifier
const SESSION_STORAGE_KEY = 'rag_session_id';

/**
 * Generates a unique identifier (UUID v4) to identify the current session.
 * @returns {string} A random UUID string.
 */
export const generateSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Returns the current session identifier, generating and persisting it
 * in localStorage on first use. Clears any stale value before regenerating.
 */
const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
};

/**
 * Clears the stored session_id. Call this when the backend rejects the
 * current session so a fresh identifier can be generated.
 */
export const clearSessionId = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the session identifier to every request
api.interceptors.request.use((config) => {
  config.headers['X-Session-ID'] = getOrCreateSessionId();
  return config;
});

// Create an Axios instance using relative path '/api' which Vite proxies to http://localhost:8000
/* const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
}); */

// Interceptor to handle specific HTTP errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Missing/invalid session: clear stored session, regenerate and reload
      if (status === 400) {
        const detail = error.response.data?.detail || '';
        if (typeof detail === 'string' && detail.toLowerCase().includes('session')) {
          clearSessionId();
          // Reload to generate a fresh session and reinitialize the app
          window.location.reload();
          return Promise.reject(error);
        }
      }

      if (status === 429 || status === 500) {
        const friendlyMessage = "Se ha alcanzado el límite de procesamiento del modelo gratuito de la API. Por favor, reintenta en un momento.";
        
        if (!error.response.data || typeof error.response.data !== 'object') {
          error.response.data = {};
        }
        error.response.data.detail = friendlyMessage;
        error.response.data.message = friendlyMessage;
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Upload a PDF document to the backend RAG pipeline.
 * @param {File} file - The PDF file object from input/dropzone.
 * @returns {Promise<{ filename: string, chunks_created: number, message: string }>}
 */
export const uploadPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Fetch list of currently indexed documents.
 * @returns {Promise<{ documents: string[] }>}
 */
export const fetchDocuments = async () => {
  const response = await api.get('/documents/list');
  return response.data;
};

/**
 * Reset vectorstore and clear uploaded documents.
 * @returns {Promise<{ message: string }>}
 */
export const resetStorage = async () => {
  const response = await api.delete('/documents/reset');
  return response.data;
};

/**
 * Send a chat question with conversation history.
 * @param {string} question - User prompt/question.
 * @param {Array<{ user: string, ai: string }>} chat_history - Conversation history array.
 * @returns {Promise<{ respuesta: string }>}
 */
export const sendChatMessage = async (question, chat_history = []) => {
  const response = await api.post('/chat', {
    question,
    chat_history,
  });
  return response.data;
};

/**
 * Health check endpoint.
 * @returns {Promise<{ status: string }>}
 */
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
