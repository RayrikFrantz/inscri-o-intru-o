import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Users,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Search,
  FileText,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { Participant, BlockedMatricula, Turno, Horario } from '../types';

interface TurmaExtraAdmSectionProps {
  participants: Participant[];
  blockedList: BlockedMatricula[];
  onRegisterParticipant: (
    data: Omit<Participant, 'id' | 'codigoAutenticacao' | 'dataCadastro' | 'status'>
  ) => boolean;
  onViewComprovante: (p: Participant) => void;
}

export const TurmaExtraAdmSection: React.FC<TurmaExtraAdmSectionProps> = ({
  participants,
  blockedList,
  onRegisterParticipant,
  onViewComprovante,
}) => {
  const [selectedExtraTurma, setSelectedExtraTurma] = useState<'terca' | 'quinta'>('terca');
  const [activeSubTab, setActiveSubTab] = useState<'inscrever' | 'inscritos'>('inscrever');
  const [tercaDate, setTercaDate] = useState('2026-09-22');
  const [quintaDate, setQuintaDate] = useState('2026-09-24');
  const [matricula, setMatricula] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [funcao, setFuncao] = useState('');
  const [tipoVeiculo, setTipoVeiculo] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [blockedAlert, setBlockedAlert] = useState<BlockedMatricula | null>(null);
  const [searchInscritos, setSearchInscritos] = useState('');

  const extraHorario: Horario = '09h';
  const extraTurno: Turno = 'Dia';
  const extraCapacity = 20;

  const activeDate = selectedExtraTurma === 'terca' ? tercaDate : quintaDate;
  const activeDayName = selectedExtraTurma === 'terca' ? 'Terça-feira' : 'Quinta-feira';

  const tercaEnrolled = participants.filter(
    (p) => p.data === tercaDate && p.horario === extraHorario && p.status === 'confirmado'
  );
  const quintaEnrolled = participants.filter(
    (p) => p.data === quintaDate && p.horario === extraHorario && p.status === 'confirmado'
  );

  const tercaRemaining = Math.max(0, extraCapacity - tercaEnrolled.length);
  const quintaRemaining = Math.max(0, extraCapacity - quintaEnrolled.length);
  const totalExtraRemaining = tercaRemaining + quintaRemaining;
  const totalExtraCapacity = extraCapacity * 2;

  const activeEnrolledList = selectedExtraTurma === 'terca' ? tercaEnrolled : quintaEnrolled;
  const activeRemaining = selectedExtraTurma === 'terca' ? tercaRemaining : quintaRemaining;

  const filteredActiveList = activeEnrolledList.filter(
    (p) =>
      !searchInscritos.trim() ||
      p.nome.toLowerCase().includes(searchInscritos.toLowerCase()) ||
      p.matricula.includes(searchInscritos.trim()) ||
      p.funcao.toLowerCase().includes(searchInscritos.toLowerCase())
  );

  const handleMatriculaChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 8);
    setMatricula(cleaned);
    setErrorMessage(null);
    if (cleaned.length >= 5) {
      const isBlocked = blockedList.find((b) => b.matricula === cleaned);
      setBlockedAlert(isBlocked || null);
    } else {
      setBlockedAlert(null);
    }
  };

  const handleExtraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cm = matricula.trim();
    const cn = nome.trim();
    const ce = email.trim();
    const cf = funcao.trim();

    if (!cm || cm.length < 5) return setErrorMessage('Informe uma matricula valida com no minimo 5 digitos.');
    if (!cn || cn.length < 3) return setErrorMessage('Informe o nome completo do colaborador.');
    if (!ce || !ce.includes('@')) return setErrorMessage('Informe um e-mail valido.');
    if (!cf) return setErrorMessage('Informe a funcao ou cargo do colaborador.');

    const isBlocked = blockedList.find((b) => b.matricula === cm);
    if (isBlocked) {
      setBlockedAlert(isBlocked);
      return setErrorMessage('Matricula com restricao no SESMT/Admin: ' + isBlocked.motivo + '.');
    }
    if (activeRemaining <= 0)
      return setErrorMessage('A turma extra de ' + activeDayName + ' ja atingiu a capacidade maxima.');

    const alreadyEnrolled = participants.some(
      (p) =>
        p.matricula === cm &&
        p.data === activeDate &&
        p.horario === extraHorario &&
        p.status === 'confirmado'
    );
    if (alreadyEnrolled)
      return setErrorMessage('Colaborador ' + cm + ' ja inscrito nesta turma extra de ' + activeDayName + '.');

    const success = onRegisterParticipant({
      matricula: cm,
      nome: cn,
      email: ce,
      funcao: cf,
      tipoVeiculo: tipoVeiculo.trim() || 'Nao informado',
      data: activeDate,
      turno: extraTurno,
      horario: extraHorario,
    });

    if (success) {
      setSuccessMessage('Inscricao realizada na Turma Extra de ' + activeDayName + ' as 09:00h!');
      setMatricula('');
      setNome('');
      setEmail('');
      setFuncao('');
      setTipoVeiculo('');
      setBlockedAlert(null);
      setActiveSubTab('inscritos');
    }
  };

  const handleDateInputChange = (newDate: string) => {
    if (!newDate) return;
    const [y, m, d] = newDate.split('-').map(Number);
    const checkDate = new Date(y, m - 1, d);
    const dayOfWeek = checkDate.getDay();

    if (dayOfWeek === 2) {
      setTercaDate(newDate);
      setSelectedExtraTurma('terca');
    } else if (dayOfWeek === 4) {
      setQuintaDate(newDate);
      setSelectedExtraTurma('quinta');
    } else {
      const targetDate = new Date(checkDate);
      if (dayOfWeek === 3 || dayOfWeek === 5) {
        targetDate.setDate(checkDate.getDate() + (dayOfWeek === 3 ? 1 : -1));
        const adj = targetDate.getFullYear() + '-' +
          String(targetDate.getMonth() + 1).padStart(2, '0') + '-' +
          String(targetDate.getDate()).padStart(2, '0');
        setQuintaDate(adj);
        setSelectedExtraTurma('quinta');
      } else {
        targetDate.setDate(checkDate.getDate() + (dayOfWeek === 1 ? 1 : dayOfWeek === 0 ? 2 : 3));
        const adj = targetDate.getFullYear() + '-' +
          String(targetDate.getMonth() + 1).padStart(2, '0') + '-' +
          String(targetDate.getDate()).padStart(2, '0');
        setTercaDate(adj);
        setSelectedExtraTurma('terca');
      }
    }
  };

  return (
    <div
      id="secao-turmas-extras-adm"
      className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border-2 border-cyan-500/30 overflow-hidden transition-all"
    >
      {/* HEADER */}
      <div className="bg-[#000e1e] text-white px-4 py-3 sm:px-6 sm:py-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white leading-tight">
                Turmas de ADM
              </h3>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold uppercase">
                  Terca &amp; Quinta as 09h
                </span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold uppercase">
                  Turma Extra
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 shrink-0 self-start sm:self-center">
            <div className="text-right">
              <div className="text-[9px] uppercase font-bold text-slate-400 leading-none">Vagas Extras</div>
              <div className="text-xs sm:text-sm font-black text-cyan-300 font-mono mt-0.5">
                {totalExtraRemaining} livres / {totalExtraCapacity}
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-cyan-400/20 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="p-5 sm:p-7 space-y-6">

        {/* SELETOR DE TURMA */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-600" />
              <span>1. Selecione a Turma Extra:</span>
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-700" />
                <span>Calendario de Selecao:</span>
              </span>
              <input
                type="date"
                value={activeDate}
                onChange={(e) => handleDateInputChange(e.target.value)}
                className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 bg-white font-semibold focus:ring-2 focus:ring-cyan-600 focus:outline-none cursor-pointer"
              />
              <span className="text-[11px] font-bold text-cyan-900 bg-cyan-100/80 px-2 py-0.5 rounded-md border border-cyan-200">
                {activeDayName}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* TERCA */}
            <button
              type="button"
              onClick={() => setSelectedExtraTurma('terca')}
              className={'p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ' +
                (selectedExtraTurma === 'terca'
                  ? 'bg-cyan-50/70 border-cyan-500 ring-2 ring-cyan-400 shadow-md'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white shadow-xs')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-600 animate-pulse" />
                    <span className="font-black text-sm sm:text-base text-[#0f2439]">Terca-feira - 09:00h</span>
                  </div>
                  <span className="text-xs text-slate-600 font-medium mt-0.5 block">
                    Turno Dia - Sala de Treinamento SESMT
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-200">
                  Turma Extra 1
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="font-semibold text-slate-700">Data:</span>
                  <input
                    type="date"
                    value={tercaDate}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => { e.stopPropagation(); handleDateInputChange(e.target.value); setSelectedExtraTurma('terca'); }}
                    className="border border-slate-300 rounded-md px-2 py-0.5 text-xs text-slate-800 bg-white font-medium cursor-pointer"
                  />
                </div>
                <span className="font-mono font-bold text-cyan-950 bg-cyan-100/70 px-2 py-0.5 rounded">
                  {tercaRemaining} vagas livres ({tercaEnrolled.length}/{extraCapacity})
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="h-full bg-cyan-600 rounded-full transition-all"
                  style={{ width: Math.min(100, Math.round((tercaEnrolled.length / extraCapacity) * 100)) + '%' }}
                />
              </div>
            </button>

            {/* QUINTA */}
            <button
              type="button"
              onClick={() => setSelectedExtraTurma('quinta')}
              className={'p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ' +
                (selectedExtraTurma === 'quinta'
                  ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-400 shadow-md'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white shadow-xs')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse" />
                    <span className="font-black text-sm sm:text-base text-[#0f2439]">Quinta-feira - 09:00h</span>
                  </div>
                  <span className="text-xs text-slate-600 font-medium mt-0.5 block">
                    Turno Dia - Sala de Treinamento SESMT
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                  Turma Extra 2
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-semibold text-slate-700">Data:</span>
                  <input
                    type="date"
                    value={quintaDate}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => { e.stopPropagation(); handleDateInputChange(e.target.value); setSelectedExtraTurma('quinta'); }}
                    className="border border-slate-300 rounded-md px-2 py-0.5 text-xs text-slate-800 bg-white font-medium cursor-pointer"
                  />
                </div>
                <span className="font-mono font-bold text-indigo-950 bg-indigo-100/70 px-2 py-0.5 rounded">
                  {quintaRemaining} vagas livres ({quintaEnrolled.length}/{extraCapacity})
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all"
                  style={{ width: Math.min(100, Math.round((quintaEnrolled.length / extraCapacity) * 100)) + '%' }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* SUB-ABAS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setActiveSubTab('inscrever'); setErrorMessage(null); setSuccessMessage(null); }}
              className={'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ' +
                (activeSubTab === 'inscrever' ? 'bg-[#000e1e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')}
            >
              <UserPlus className="w-4 h-4 text-cyan-400" />
              <span>Inscrever Colaborador</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveSubTab('inscritos'); setErrorMessage(null); setSuccessMessage(null); }}
              className={'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ' +
                (activeSubTab === 'inscritos' ? 'bg-[#000e1e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')}
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Ver Inscritos ({activeEnrolledList.length})</span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3.5 h-3.5 text-cyan-700" />
            <span className="font-bold text-slate-600">Data da Turma:</span>
            <input
              type="date"
              value={activeDate}
              onChange={(e) => handleDateInputChange(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 bg-white font-semibold focus:ring-2 focus:ring-cyan-600 focus:outline-none cursor-pointer"
            />
            <span className="text-[11px] font-bold text-cyan-900 bg-cyan-100/80 px-2 py-0.5 rounded-md border border-cyan-200">
              {activeDate.split('-').reverse().join('/')} ({activeDayName})
            </span>
          </div>
        </div>

        {/* ALERTS */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {blockedAlert && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs sm:text-sm flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-red-950">Matricula com restricao</strong>
              <p className="text-red-700 mt-0.5">
                {blockedAlert.nome} ({blockedAlert.matricula}) — <span className="font-bold underline">{blockedAlert.motivo}</span>. Inscricao nao autorizada.
              </p>
            </div>
          </div>
        )}

        {/* ABA INSCREVER */}
        {activeSubTab === 'inscrever' && (
          <form onSubmit={handleExtraSubmit} className="space-y-4">
            <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4 text-cyan-700 shrink-0" />
                <span>
                  Confirmando vaga para: <strong className="text-[#0f2439]">{activeDayName}</strong>{' '}
                  ({activeDate.split('-').reverse().join('/')}) as{' '}
                  <strong className="text-cyan-700">09:00h</strong> (Turno Dia)
                </span>
              </div>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full text-xs self-start sm:self-auto">
                {activeRemaining} vagas disponiveis
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Matricula *</label>
                <input
                  type="text" required placeholder="Ex: 558912"
                  value={matricula} onChange={(e) => handleMatriculaChange(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#000e1e] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text" required placeholder="Nome completo do colaborador"
                  value={nome} onChange={(e) => setNome(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#000e1e] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">E-mail *</label>
                <input
                  type="email" required placeholder="colaborador@salobo.corp"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#000e1e] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Funcao / Cargo *</label>
                <input
                  type="text" required placeholder="Ex: Operador de Caminhao Fora de Estrada"
                  value={funcao} onChange={(e) => setFuncao(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#000e1e] bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Tipo de Veiculo *</span>
                </label>
                <input
                  type="text" required placeholder="Ex: Caminhao Fora de Estrada, Hilux..."
                  value={tipoVeiculo} onChange={(e) => setTipoVeiculo(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#000e1e] bg-white font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!!blockedAlert || activeRemaining <= 0}
              className="w-full h-12 rounded-xl bg-[#000e1e] hover:bg-[#0f2439] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-cyan-400" />
              <span>Confirmar Inscricao - Turma Extra {activeDayName} as 09:00h</span>
            </button>
          </form>
        )}

        {/* ABA INSCRITOS */}
        {activeSubTab === 'inscritos' && (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar participante por nome, matricula ou funcao..."
                value={searchInscritos}
                onChange={(e) => setSearchInscritos(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#000e1e] bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {searchInscritos && (
                <button
                  type="button"
                  onClick={() => setSearchInscritos('')}
                  className="absolute right-3.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            {filteredActiveList.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">Nenhum participante encontrado</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nao ha colaboradores confirmados nesta turma com o filtro informado.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('inscrever')}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:underline cursor-pointer"
                >
                  Cadastrar nova inscricao nesta turma extra
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {filteredActiveList.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-cyan-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{p.nome}</span>
                        <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          Matricula: {p.matricula}
                        </span>
                        <span className="text-[10px] font-bold text-cyan-900 bg-cyan-50 border border-cyan-300 px-2 py-0.5 rounded">
                          09:00h - Extra
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 text-xs flex-wrap">
                        <span className="font-medium text-slate-700">{p.funcao}</span>
                        {p.tipoVeiculo && (
                          <span className="inline-flex items-center gap-1 text-cyan-950 font-medium bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 text-[11px]">
                            <Truck className="w-3 h-3 text-cyan-700" />
                            {p.tipoVeiculo}
                          </span>
                        )}
                        <span className="font-mono text-slate-400 text-[11px]">{p.codigoAutenticacao}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onViewComprovante(p)}
                      className="shrink-0 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-cyan-500 bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-950 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-end sm:self-center"
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-700" />
                      Comprovante
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Certificacao oficial de integracao e reciclagem de trafego de mina Salobo.</span>
        </div>
        <span className="font-mono font-medium text-[11px] text-slate-400">
          Codigo de Portaria: ADM-EXTRA-09H-2026
        </span>
      </div>
    </div>
  );
};
