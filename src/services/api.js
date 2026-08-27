import axios from 'axios';

// Create an Axios instance using relative path '/api' which Vite proxies to http://localhost:8000
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle specific HTTP errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
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
