import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Calendar, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, LayoutGrid, Truck } from 'lucide-react';
import { Turno, Horario, Participant, BlockedMatricula } from '../types';

interface InscricaoFormProps {
  selectedData: string;
  selectedTurno: Turno;
  selectedHorario: Horario;
  onDataChange: (data: string) => void;
  onTurnoChange: (turno: Turno) => void;
  onHorarioChange: (horario: Horario) => void;
  getSlotStats: (turno: Turno, horario: Horario) => { count: number; capacity: number; remaining: number };
  blockedList: BlockedMatricula[];
  existingParticipants: Participant[];
  onSubmitInscricao: (participant: Omit<Participant, 'id' | 'codigoAutenticacao' | 'dataCadastro' | 'status'>) => Promise<boolean>;
}

export const InscricaoForm: React.FC<InscricaoFormProps> = ({
  selectedData,
  selectedTurno,
  selectedHorario,
  onDataChange,
  onTurnoChange,
  onHorarioChange,
  getSlotStats,
  blockedList,
  existingParticipants,
  onSubmitInscricao,
}) => {
  const [matricula, setMatricula] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [funcao, setFuncao] = useState('');
  const [tipoVeiculo, setTipoVeiculo] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [blockedAlert, setBlockedAlert] = useState<BlockedMatricula | null>(null);

  const currentStats = getSlotStats(selectedTurno, selectedHorario);

  // Available times for selected shift
  const availableHorarios: Horario[] = selectedTurno === 'Dia' ? ['05h', '08h'] : ['17h', '20h'];

  // Check if current selected time is valid for selected shift
  useEffect(() => {
    if (!availableHorarios.includes(selectedHorario)) {
      onHorarioChange(availableHorarios[0]);
    }
  }, [selectedTurno]);

  // Live check for blocked matrícula
  const handleMatriculaChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 8);
    setMatricula(cleaned);
    setErrorMessage(null);

    if (cleaned.length >= 5) {
      const isBlocked = blockedList.find((b) => b.matricula === cleaned);
      if (isBlocked) {
        setBlockedAlert(isBlocked);
      } else {
        setBlockedAlert(null);
      }
    } else {
      setBlockedAlert(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!matricula.trim() || matricula.length < 5) {
      setErrorMessage('Por favor, informe uma matrícula válida (mínimo 5 dígitos).');
      return;
    }

    if (!nome.trim() || nome.trim().length < 3) {
      setErrorMessage('Por favor, informe o nome completo do colaborador.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor, informe um endereço de e-mail corporativo ou pessoal válido.');
      return;
    }

    if (!funcao.trim()) {
      setErrorMessage('Por favor, informe a função ou cargo.');
      return;
    }

    // Check blocked status
    const isBlocked = blockedList.find((b) => b.matricula === matricula);
    if (isBlocked) {
      setBlockedAlert(isBlocked);
      setErrorMessage(`Matrícula bloqueada: ${isBlocked.motivo}. Acesso negado pelo SESMT/Administrador.`);
      return;
    }

    // Check duplicate registration on this date
    const alreadyRegistered = existingParticipants.find(
      (p) => p.matricula === matricula && p.data === selectedData && p.status === 'confirmado'
    );
    if (alreadyRegistered) {
      setErrorMessage(
        `Colaborador já inscrito nesta data (${selectedData}) na turma de ${alreadyRegistered.turno} às ${alreadyRegistered.horario}.`
      );
      return;
    }

    // Check total day limit (40) and slot limit (20)
    const dayConfirmedCount = existingParticipants.filter(
      (p) => p.data === selectedData && p.status === 'confirmado'
    ).length;

    if (dayConfirmedCount >= 40) {
      setErrorMessage('O limite de 40 vagas no dia para esta data já foi atingido. Por favor, selecione outra data.');
      return;
    }

    // Check slot availability
    if (currentStats.count >= 20 || currentStats.remaining <= 0) {
      setErrorMessage('A turma selecionada já atingiu o limite de 20 vagas. Por favor, selecione outro horário.');
      return;
    }

    const success = await onSubmitInscricao({
      matricula,
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      funcao: funcao.trim(),
      tipoVeiculo: tipoVeiculo.trim() || 'Não informado',
      data: selectedData,
      turno: selectedTurno,
      horario: selectedHorario,
    });

    if (success) {
      // Clear inputs
      setMatricula('');
      setNome('');
      setEmail('');
      setFuncao('');
      setTipoVeiculo('');
      setErrorMessage(null);
      setBlockedAlert(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      {/* Form Header matching Image 4 */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-100 text-[#0f2439]">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#0f2439] leading-tight">
            Dados para<br className="xs:hidden" /> Inscrição
          </h2>
        </div>
        <div className="bg-[#eff4ff] text-blue-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200">
          {currentStats.remaining} vagas restantes
        </div>
      </div>

      {/* Blocked Matrícula Warning Banner */}
      {blockedAlert && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-xs sm:text-sm animate-in fade-in duration-150">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-red-900 mb-0.5">
              Matrícula Bloqueada pelo Sistema
            </strong>
            <p className="text-red-700">
              {blockedAlert.nome} ({blockedAlert.matricula}) possui restrição:{' '}
              <span className="font-semibold underline">{blockedAlert.motivo}</span>.
              Inscrição suspensa até liberação pelo Administrador.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-amber-900 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* MATRÍCULA */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Matrícula
          </label>
          <input
            type="text"
            required
            placeholder="Ex: 554109"
            value={matricula}
            onChange={(e) => handleMatriculaChange(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2439] focus:border-transparent font-mono bg-white"
          />
        </div>

        {/* NOME COMPLETO */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Nome Completo
          </label>
          <input
            type="text"
            required
            placeholder="Nome do colaborador"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2439] focus:border-transparent bg-white"
          />
        </div>

        {/* E-MAIL CORPORATIVO / PESSOAL */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            E-mail Corporativo / Pessoal
          </label>
          <input
            type="email"
            required
            placeholder="ex: colaborador@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2439] focus:border-transparent bg-white"
          />

          {/* Email Info Note matching Image 4 */}
          <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2 text-slate-600 text-xs leading-relaxed">
            <span className="text-base leading-none">✉️</span>
            <span>
              Uma ficha de confirmação com dia, turma e horário de treinamento será enviada automaticamente para o seu e-mail após a confirmação.
            </span>
          </div>
        </div>

        {/* FUNÇÃO */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Função
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Operador de Equipamentos Pesados"
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2439] focus:border-transparent bg-white"
          />
        </div>

        {/* TIPO DE VEÍCULO */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-cyan-700" />
            <span>Tipo de Veículo</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Caminhão Fora de Estrada, Hilux, Trator de Esteira..."
            value={tipoVeiculo}
            onChange={(e) => setTipoVeiculo(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2439] focus:border-transparent bg-white text-slate-800 font-medium"
          />
        </div>

        {/* DATA & TURNO */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Data
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={selectedData}
                onChange={(e) => onDataChange(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2439] focus:border-transparent bg-white text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Turno
            </label>
            <select
              value={selectedTurno}
              onChange={(e) => onTurnoChange(e.target.value as Turno)}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2439] focus:border-transparent bg-white text-slate-800 font-medium"
            >
              <option value="Dia">Dia</option>
              <option value="Noite">Noite</option>
            </select>
          </div>
        </div>

        {/* HORÁRIO DISPONÍVEL */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Horário Disponível
          </label>
          <select
            value={selectedHorario}
            onChange={(e) => onHorarioChange(e.target.value as Horario)}
            className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2439] focus:border-transparent bg-white text-slate-800 font-medium"
          >
            {availableHorarios.map((h) => {
              const stats = getSlotStats(selectedTurno, h);
              return (
                <option key={h} value={h} disabled={stats.remaining <= 0}>
                  {h} ({stats.remaining} disponíveis) {stats.remaining <= 0 ? '- ESGOTADO' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* CONFIRMAR INSCRIÇÃO BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!!blockedAlert || currentStats.remaining <= 0}
            className="w-full h-12 rounded-xl bg-[#000e1e] hover:bg-[#0f2439] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Confirmar Inscrição</span>
          </button>
        </div>
      </form>
    </div>
  );
};
