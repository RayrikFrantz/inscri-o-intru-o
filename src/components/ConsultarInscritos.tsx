import React, { useState } from 'react';
import { Search, Calendar, Clock, Award, FileText, UserCheck, Trash2, Truck } from 'lucide-react';
import { Participant, Turno, Horario } from '../types';

interface ConsultarInscritosProps {
  participants: Participant[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onViewComprovante: (p: Participant) => void;
  onCancelInscricao?: (id: string) => void;
}

export const ConsultarInscritos: React.FC<ConsultarInscritosProps> = ({
  participants,
  selectedDate,
  onDateChange,
  onViewComprovante,
  onCancelInscricao,
}) => {
  const [filterTurno, setFilterTurno] = useState<string>('Dia');
  const [filterHorario, setFilterHorario] = useState<string>('08h');
  const [searchQuery, setSearchQuery] = useState('');

  const handleTurnoChange = (newTurno: string) => {
    setFilterTurno(newTurno);
    if (newTurno === 'Dia') {
      if (filterHorario !== '05h' && filterHorario !== '08h' && filterHorario !== '09h' && filterHorario !== 'Todos') {
        setFilterHorario('08h');
      }
    } else if (newTurno === 'Noite') {
      if (filterHorario !== '17h' && filterHorario !== '20h' && filterHorario !== 'Todos') {
        setFilterHorario('17h');
      }
    }
  };

  // Filter participants
  const filtered = participants.filter((p) => {
    // Date match
    const dateMatches = !selectedDate || p.data === selectedDate;

    // Turno match
    const turnoMatches = filterTurno === 'Todos' || p.turno === filterTurno;

    // Horario match
    const horarioMatches = filterHorario === 'Todos' || p.horario === filterHorario;

    // Search query match (name or matricula)
    const searchMatches =
      !searchQuery.trim() ||
      p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.matricula.includes(searchQuery.trim());

    return dateMatches && turnoMatches && horarioMatches && searchMatches && p.status === 'confirmado';
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header matching Image 4 */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <Search className="w-5 h-5 text-[#0f2439]" />
        <h2 className="text-base sm:text-lg font-bold text-[#0f2439] tracking-tight">
          Consultar Inscritos por Data
        </h2>
      </div>

      {/* Filter Row matching Image 4 (Data, Turma, Horário) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Data */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Data
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2439] bg-white font-medium text-slate-800"
          />
        </div>

        {/* Turma */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Turma
          </label>
          <select
            value={filterTurno}
            onChange={(e) => handleTurnoChange(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2439] bg-white font-medium text-slate-800"
          >
            <option value="Todos">Todas as Turmas</option>
            <option value="Dia">Dia</option>
            <option value="Noite">Noite</option>
          </select>
        </div>

        {/* Horário */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Horário
          </label>
          <select
            value={filterHorario}
            onChange={(e) => setFilterHorario(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2439] bg-white font-medium text-slate-800"
          >
            <option value="Todos">Todos os Horários</option>
            {filterTurno === 'Dia' ? (
              <>
                <option value="05h">05h</option>
                <option value="08h">08h</option>
                <option value="09h">09h (Turma Extra)</option>
              </>
            ) : filterTurno === 'Noite' ? (
              <>
                <option value="17h">17h</option>
                <option value="20h">20h</option>
              </>
            ) : (
              <>
                <option value="05h">05h (Dia)</option>
                <option value="08h">08h (Dia)</option>
                <option value="09h">09h (Extra - Dia)</option>
                <option value="17h">17h (Noite)</option>
                <option value="20h">20h (Noite)</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Optional Search filter */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por nome ou matrícula..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-9 px-3.5 pl-9 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0f2439] bg-slate-50/50"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-2"
          >
            Limpar
          </button>
        )}
      </div>

      {/* List of Enrolled matching Mariana Nogueira Rocha Card */}
      <div className="space-y-2.5 pt-1">
        {filtered.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
            Nenhum participante inscrito encontrado para este filtro de data e horário.
          </div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-[#f8fafc]/50 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3 shadow-2xs group"
            >
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-base text-[#0f2439] truncate">
                  {p.nome}
                </h3>
                <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>Matrícula: <strong className="font-mono text-slate-800">{p.matricula}</strong></span>
                  <span>•</span>
                  <span>{p.funcao}</span>
                  {p.tipoVeiculo && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-900 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded">
                        <Truck className="w-3 h-3 text-cyan-700 shrink-0" />
                        <span className="truncate max-w-[200px]">{p.tipoVeiculo}</span>
                      </span>
                    </>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                  Autenticação: {p.codigoAutenticacao}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                {/* Badge matching Image 4: "Dia • 08h" */}
                <div className="bg-white border border-slate-200 text-[#0f2439] font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs text-center whitespace-nowrap">
                  {p.turno} • {p.horario}
                </div>

                {/* Comprovante button */}
                <button
                  type="button"
                  onClick={() => onViewComprovante(p)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-blue-800 hover:bg-blue-50 rounded-md border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Ver Comprovante Oficial"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Comprovante</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
