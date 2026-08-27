import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, CornerDownLeft } from 'lucide-react';

export default function ChatInput({
  onSendMessage,
  isBotThinking = false,
  hasDocuments = false,
}) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const isDisabled = isBotThinking || !hasDocuments;

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isDisabled) return;

    onSendMessage(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getPlaceholder = () => {
    if (!hasDocuments) {
      return 'Por favor sube un documento PDF para comenzar a realizar preguntas...';
    }
    if (isBotThinking) {
      return 'El bot está procesando la respuesta...';
    }
    return 'Escribe tu pregunta sobre el documento cargado... (Enter para enviar, Shift+Enter para salto de línea)';
  };

  return (
    <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-slate-200/80 rounded-b-2xl">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            placeholder={getPlaceholder()}
            className="w-full resize-none py-3 pl-4 pr-10 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-800 disabled:opacity-60 disabled:bg-slate-100 disabled:cursor-not-allowed leading-relaxed"
          />

          {/* Hint badge inside textarea */}
          {hasDocuments && !isBotThinking && text.trim() && (
            <div className="absolute right-3 bottom-3 text-[10px] text-slate-400 font-medium flex items-center gap-1 pointer-events-none">
              <span>Enter</span>
              <CornerDownLeft className="w-3 h-3" />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isDisabled || !text.trim()}
          className="inline-flex items-center justify-center p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer shrink-0 h-[46px] w-[46px]"
          title="Enviar pregunta"
        >
          {isBotThinking ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Chatbot Empresarial RAG con Inteligencia Artificial
        </span>
        <span className="hidden sm:inline">Shift + Enter para salto de línea</span>
      </div>
    </div>
  );
}
