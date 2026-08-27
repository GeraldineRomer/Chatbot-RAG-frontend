import React, { useRef, useEffect } from 'react';
import { Bot, User, Sparkles, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Normalizes Markdown text from AI output so that bold/italic markup
 * (such as ***text***, **text**, or ** text **) correctly converts
 * into formatted HTML elements without displaying raw asterisks.
 */
const formatMarkdownText = (text) => {
  if (!text) return '';

  let formatted = text;

  // Remove backslash escaping from asterisks (\* -> *)
  formatted = formatted.replace(/\\(\*)/g, '$1');

  // Convert triple asterisks (***text*** or *** text ***) to bold: **text**
  formatted = formatted.replace(/\*\*\*\s*(.*?)\s*\*\*\*/g, '**$1**');

  // Fix internal spaces in double asterisks (** text ** -> **text**)
  formatted = formatted.replace(/\*\*\s*(.*?)\s*\*\*/g, '**$1**');

  // Fix asymmetric asterisks (***text** or **text*** -> **text**)
  formatted = formatted.replace(/\*\*\*\s*(.*?)\s*\*\*/g, '**$1**');
  formatted = formatted.replace(/\*\*\s*(.*?)\s*\*\*\*/g, '**$1**');

  return formatted;
};

export default function ChatWindow({
  messages = [],
  isBotThinking = false,
  hasDocuments = false,
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotThinking]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 min-h-[350px]">
      {/* Empty State */}
      {messages.length === 0 && !isBotThinking && (
        <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg text-white">
              <Bot className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-white rounded-full p-1 text-white">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-lg font-bold text-slate-800">
              ¡Hola! Soy tu Asistente Empresarial RAG
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {hasDocuments
                ? 'Los documentos ya están listos. Hazme cualquier pregunta sobre la información subida.'
                : 'Para comenzar, sube un documento PDF en el panel lateral. Luego responderé todas tus dudas basándome en su contenido.'}
            </p>
          </div>

          {!hasDocuments && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800 text-xs font-medium">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Pendiente: Carga tu primer documento PDF</span>
            </div>
          )}
        </div>
      )}

      {/* Chat Messages */}
      {messages.map((msg, index) => (
        <div key={index} className="space-y-4">
          {/* User Message */}
          {msg.user && (
            <div className="flex items-start justify-end gap-3 group">
              <div className="max-w-[85%] sm:max-w-[75%] bg-gradient-to-r from-indigo-600 to-indigo-500 text-white p-4 rounded-2xl rounded-tr-xs shadow-sm hover:shadow transition-shadow">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {msg.user}
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-indigo-200/60">
                <User className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Bot Answer */}
          {msg.ai && (
            <div className="flex items-start justify-start gap-3 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="max-w-[85%] sm:max-w-[75%] bg-slate-100/90 text-slate-800 border border-slate-200/80 p-4 rounded-2xl rounded-tl-xs shadow-xs hover:shadow-sm transition-shadow">
                <div className="text-sm leading-relaxed break-words">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li className="text-sm leading-relaxed" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
                      b: ({ node, ...props }) => <b className="font-bold text-slate-900" {...props} />,
                      em: ({ node, ...props }) => <em className="italic font-bold text-slate-900" {...props} />,
                      i: ({ node, ...props }) => <i className="italic font-bold text-slate-900" {...props} />,
                      a: ({ node, ...props }) => <a className="text-indigo-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                      h1: ({ node, ...props }) => <h1 className="text-lg font-bold mt-3 mb-1 text-slate-900" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-base font-bold mt-2 mb-1 text-slate-900" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-sm font-bold mt-2 mb-1 text-slate-900" {...props} />,
                      hr: () => <hr className="my-3 border-slate-300" />,
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return className ? (
                          <pre className="bg-slate-800 text-slate-100 p-3 rounded-lg text-xs font-mono my-2 overflow-x-auto">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code className="bg-slate-200 px-1 py-0.5 rounded text-xs font-mono font-semibold" {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {formatMarkdownText(msg.ai)}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Thinking / Loading State */}
      {isBotThinking && (
        <div className="flex items-start justify-start gap-3 animate-fadeIn">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div className="bg-slate-100 border border-slate-200/80 p-4 rounded-2xl rounded-tl-xs shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
              </div>
              <span className="text-xs font-medium text-slate-500">
                El bot está consultando el documento y generando la respuesta...
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
