import React from 'react';
import { Clock, Calendar, CheckCircle, Users } from 'lucide-react';
import { Turno, Horario } from '../types';

interface TurmasStatusGridProps {
  selectedTurno: Turno;
  selectedHorario: Horario;
  onSelectTurma: (turno: Turno, horario: Horario) => void;
  getSlotStats: (turno: Turno, horario: Horario) => { count: number; capacity: number; remaining: number };
}

export const TurmasStatusGrid: React.FC<TurmasStatusGridProps> = ({
  selectedTurno,
  selectedHorario,
  onSelectTurma,
  getSlotStats,
}) => {
  const turmasList: { turno: Turno; horario: Horario }[] = [
    { turno: 'Dia', horario: '05h' },
    { turno: 'Dia', horario: '08h' },
    { turno: 'Noite', horario: '17h' },
    { turno: 'Noite', horario: '20h' },
  ];

  const currentSelectionStats = getSlotStats(selectedTurno, selectedHorario);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#0f2439]" />
          <h2 className="text-base font-bold text-[#0f2439] tracking-tight uppercase">
            Vagas por Turma
          </h2>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          20 por horário • máx. 40 por dia
        </span>
      </div>

      {/* 2x2 Grid matching Image 4 */}
      <div className="grid grid-cols-2 gap-3">
        {turmasList.map(({ turno, horario }) => {
          const stats = getSlotStats(turno, horario);
          const isSelected = selectedTurno === turno && selectedHorario === horario;
          const isFull = stats.remaining <= 0;

          return (
            <button
              key={`${turno}-${horario}`}
              type="button"
              onClick={() => onSelectTurma(turno, horario)}
              disabled={isFull}
              className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden cursor-pointer ${
                isSelected
                  ? 'bg-[#eff4ff] border-blue-500 shadow-sm ring-1 ring-blue-500'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
              } ${isFull ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Top row: Shift badge & count ratio */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                    turno === 'Dia'
                      ? 'bg-blue-100/80 text-blue-800'
                      : 'bg-[#0f2439] text-white'
                  }`}
                >
                  {turno.toUpperCase()}
                </span>
                <span className="text-xs font-bold font-mono text-emerald-700">
                  {stats.count}/{stats.capacity}
                </span>
              </div>

              {/* Time display */}
              <div className="text-2xl font-black text-[#0f2439] tracking-tight my-0.5">
                {horario}
              </div>

              {/* Remaining badge */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>{stats.remaining} disponíveis</span>
              </div>

              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Slot Remaining Indicator Bar matching Image 4 */}
      <div className="bg-[#eff4ff] border border-blue-100 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#0f2439] font-medium">
          <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Vagas restantes nesta seleção:</span>
        </div>
        <div className="bg-white px-3 py-1 rounded-lg border border-blue-200 shadow-2xs font-bold text-xs sm:text-sm text-[#0f2439] font-mono">
          {currentSelectionStats.remaining} de {currentSelectionStats.capacity} vagas
        </div>
      </div>
    </div>
  );
};
