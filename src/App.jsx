import React, { useState, useEffect } from 'react';
import { fetchDocuments, sendChatMessage, checkHealth } from './services/api';
import OnboardingGuide from './components/OnboardingGuide';
import UploadPDF from './components/UploadPDF';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import {
  Bot,
  Sparkles,
  RefreshCw,
  Trash2,
  FileText,
  ShieldCheck,
} from 'lucide-react';

// Default welcome message shown in the chat when there is no prior history.
// This is purely visual and must NOT be sent to the backend as chat context.
const WELCOME_MESSAGE =
  '¡Hola! 👋 Aún no has subido ningún documento. Por favor, dirígete al panel de carga (desliza hacia arriba o busca la sección de carga) y sube un archivo PDF para que podamos empezar a interactuar.';

export default function App() {
  const [messages, setMessages] = useState([
    { user: '', ai: WELCOME_MESSAGE },
  ]); // [{ user: string, ai: string }]
  const [documents, setDocuments] = useState([]); // string[]
  const [isUploading, setIsUploading] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  // Function to refresh data on demand (e.g. clicking refresh button)
  const refreshData = async () => {
    setBackendStatus('checking');
    try {
      await checkHealth();
      setBackendStatus('online');

      const docsData = await fetchDocuments();
      if (docsData && Array.isArray(docsData.documents)) {
        setDocuments(docsData.documents);
      }
    } catch (err) {
      console.warn('Backend health check or document fetch failed:', err);
      setBackendStatus('offline');
    }
  };

  // Load existing documents & check API health on mount
  useEffect(() => {
    let ignore = false;

    async function init() {
      try {
        await checkHealth();
        if (!ignore) {
          setBackendStatus('online');
          const docsData = await fetchDocuments();
          if (docsData && Array.isArray(docsData.documents)) {
            setDocuments(docsData.documents);
          }
        }
      } catch (err) {
        console.warn('Backend health check or document fetch failed:', err);
        if (!ignore) {
          setBackendStatus('offline');
        }
      }
    }

    init();

    return () => {
      ignore = true;
    };
  }, []);

  const handleUploadSuccess = (uploadResponse) => {
    // Refresh document list
    fetchDocuments()
      .then((data) => {
        if (data && Array.isArray(data.documents)) {
          setDocuments(data.documents);
        } else if (uploadResponse?.filename) {
          setDocuments((prev) =>
            prev.includes(uploadResponse.filename)
              ? prev
              : [...prev, uploadResponse.filename]
          );
        }
      })
      .catch(() => {
        if (uploadResponse?.filename) {
          setDocuments((prev) =>
            prev.includes(uploadResponse.filename)
              ? prev
              : [...prev, uploadResponse.filename]
          );
        }
      });
  };

  const handleResetSuccess = () => {
    setDocuments([]);
    // Reset to the default welcome message so the user is re-guided
    setMessages([{ user: '', ai: WELCOME_MESSAGE }]);
  };

  const handleSendMessage = async (userPrompt) => {
    if (!userPrompt || isBotThinking) return;

    // Build history parameter from previous turns.
    // The welcome message (empty user) is visual-only and is excluded.
    const historial = messages
      .filter((m) => m.user)
      .map((m) => ({
        user: m.user,
        ai: m.ai,
      }));

    // Add user message immediately
    setIsBotThinking(true);

    try {
      const response = await sendChatMessage(userPrompt, historial);
      console.log('response ', response);
      const aiResponse = response.response || 'No se recibió respuesta del servidor.';

      setMessages((prev) => [
        ...prev,
        {
          user: userPrompt,
          ai: aiResponse,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      const status = error.response?.status;
      let errorMsg;

      if (status === 429 || status === 500) {
        errorMsg = 'Se ha alcanzado el límite de procesamiento del modelo gratuito de la API. Por favor, reintenta en un momento.';
      } else {
        errorMsg =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          'Ocurrió un error al procesar tu pregunta. Por favor intenta de nuevo.';
      }

      const formattedMsg = errorMsg.startsWith('⚠️') ? errorMsg : `⚠️ ${errorMsg}`;

      setMessages((prev) => [
        ...prev,
        {
          user: userPrompt,
          ai: formattedMsg,
        },
      ]);
    } finally {
      setIsBotThinking(false);
    }
  };

  const handleClearChat = () => {
    if (messages.length > 0) {
      // Keep the default welcome message as the visual placeholder
      setMessages([{ user: '', ai: WELCOME_MESSAGE }]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Chatbot Empresarial RAG
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Enterprise v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Búsqueda e Inteligencia sobre Documentos corporativos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                backendStatus === 'online'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                  : backendStatus === 'offline'
                  ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                  : 'bg-amber-50 text-amber-700 border-amber-200/80'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'online'
                    ? 'bg-emerald-500 animate-pulse'
                    : backendStatus === 'offline'
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                }`}
              />
              <span className="hidden md:inline">
                {backendStatus === 'online'
                  ? 'API Conectada'
                  : backendStatus === 'offline'
                  ? 'API Desconectada'
                  : 'Verificando...'}
              </span>
            </div>

            <button
              onClick={refreshData}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Recargar estado"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar Panel (Onboarding + Upload) */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Onboarding Guide Component */}
            <OnboardingGuide />

            {/* Upload PDF Component */}
            <UploadPDF
              documents={documents}
              onUploadSuccess={handleUploadSuccess}
              onResetSuccess={handleResetSuccess}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
            />

            {/* System Info Footnote */}
            <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200/60 text-slate-500 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span>Privacidad y Seguridad</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Los datos e historial son procesados de forma privada dentro de tu red empresarial.
              </p>
            </div>
          </aside>

          {/* Right Main Panel (Chat Container) */}
          <section className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col min-h-[600px] h-[calc(100vh-140px)]">
              {/* Chat Header Bar */}
              <div className="p-4 px-6 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">
                      Asistente Virtual RAG
                    </h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-400" />
                      {documents.length > 0
                        ? `${documents.length} documento(s) activo(s)`
                        : 'Sin documentos cargados'}
                    </p>
                  </div>
                </div>

                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Borrar conversación de pantalla"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpiar Chat</span>
                  </button>
                )}
              </div>

              {/* Chat Window Container */}
              <ChatWindow
                messages={messages}
                isBotThinking={isBotThinking}
                hasDocuments={documents.length > 0}
              />

              {/* Chat Input Container */}
              <ChatInput
                onSendMessage={handleSendMessage}
                isBotThinking={isBotThinking}
                hasDocuments={documents.length > 0}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
