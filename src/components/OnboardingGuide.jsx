import React from 'react';
import { FileUp, MessageSquare, Sparkles, BookOpen } from 'lucide-react';

export default function OnboardingGuide() {
  const steps = [
    {
      step: '01',
      icon: FileUp,
      title: 'Sube tu documento PDF',
      desc: 'Carga tus archivos PDF empresariales para alimentar la base de conocimiento.',
      bgColor: 'bg-indigo-50/80',
      iconBg: 'bg-indigo-100 text-indigo-600',
      borderColor: 'border-indigo-100',
    },
    {
      step: '02',
      icon: MessageSquare,
      title: 'Haz tus preguntas',
      desc: 'Pregunta en lenguaje natural sobre cualquier dato o sección del documento.',
      bgColor: 'bg-purple-50/80',
      iconBg: 'bg-purple-100 text-purple-600',
      borderColor: 'border-purple-100',
    },
    {
      step: '03',
      icon: Sparkles,
      title: 'Respuestas precisas con IA',
      desc: 'Obtén respuestas fundamentadas al instante con memoria de conversación.',
      bgColor: 'bg-emerald-50/80',
      iconBg: 'bg-emerald-100 text-emerald-600',
      borderColor: 'border-emerald-100',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-slate-50 border border-indigo-100/80 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-indigo-600/10 rounded-lg text-indigo-600">
          <BookOpen className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-semibold tracking-wide text-slate-800 uppercase">
          Guía de Inicio Rápido
        </h2>
      </div>

      <div className="space-y-3">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className={`p-3.5 rounded-xl border ${item.borderColor} ${item.bgColor} transition-all duration-200 hover:shadow-sm flex items-start gap-3`}
            >
              <div className={`p-2 rounded-lg ${item.iconBg} shrink-0 mt-0.5`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold text-slate-800 truncate">
                    {item.title}
                  </h3>
                  <span className="text-[10px] font-medium text-slate-400 font-mono">
                    {item.step}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
