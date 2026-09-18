import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle, Info, Calendar } from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      type: 'important',
      title: 'Transição Oficial: Mão Inglesa em Pista de Mina',
      message:
        'A circulação pela pista esquerda (mão inglesa) passa a ser obrigatória para todos os caminhões fora de estrada e veículos leves na Mina do Salobo a partir da conclusão das turmas de setembro/2026.',
      date: 'Hoje, 07:00',
    },
    {
      id: 2,
      type: 'info',
      title: 'Capacidade Limite por Turma',
      message:
        'Cada horário possui limite estrito de 20 participantes para garantir tempo individual de condução prática assistida por instrutor credenciado.',
      date: 'Ontem',
    },
    {
      id: 3,
      type: 'notice',
      title: 'Documentação Mandatória',
      message:
        'Comparecer com ASO em dia, CNH válida compatível com a categoria e crachá magnético funcional.',
      date: '15/09/2026',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0f2439]/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="p-4 bg-[#000e1e] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Avisos Operacionais</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs text-[#0f2439]">{n.title}</span>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">{n.date}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold uppercase rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
