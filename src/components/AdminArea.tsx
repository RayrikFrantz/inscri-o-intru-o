import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldAlert,
  CheckCircle2,
  UserX,
  Plus,
  Image as ImageIcon,
  Download,
  Trash2,
  Eye,
  EyeOff,
  FileJson,
  UserPlus,
  UserMinus,
  Search,
  AlertTriangle,
  Sparkles,
  Calendar,
  Briefcase,
  Truck,
} from 'lucide-react';
import { BlockedMatricula, BannerSettings, Participant, Turno, Horario } from '../types';

interface AdminAreaProps {
  blockedList: BlockedMatricula[];
  onUnblock: (matricula: string) => void;
  onAddBlock: (block: BlockedMatricula) => void;
  onOpenDirectLinkModal: () => void;
  participants: Participant[];
  bannerConfig: BannerSettings;
  onRemoveParticipant: (id: string) => void;
  onAdminAddParticipant: (
    data: Omit<Participant, 'id' | 'codigoAutenticacao' | 'dataCadastro' | 'status'>
  ) => boolean;
}

type AdminTab = 'retirar' | 'incluir_extra' | 'bloqueios' | 'exportacoes';

export const AdminArea: React.FC<AdminAreaProps> = ({
  blockedList,
  onUnblock,
  onAddBlock,
  onOpenDirectLinkModal,
  participants,
  bannerConfig,
  onRemoveParticipant,
  onAdminAddParticipant,
}) => {
  const [keyword, setKeyword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('retirar');

  // Retirar inscritos state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState<string>('todas');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Incluir extra state
  const [extraMatricula, setExtraMatricula] = useState('');
  const [extraNome, setExtraNome] = useState('');
  const [extraEmail, setExtraEmail] = useState('');
  const [extraFuncao, setExtraFuncao] = useState('');
  const [extraTipoVeiculo, setExtraTipoVeiculo] = useState('');
  const [extraData, setExtraData] = useState('2026-09-21');
  const [extraTurno, setExtraTurno] = useState<Turno>('Noite');
  const [extraHorario, setExtraHorario] = useState<Horario>('17h');
  const [extraSuccessMsg, setExtraSuccessMsg] = useState<string | null>(null);
  const [extraErrorMsg, setExtraErrorMsg] = useState<string | null>(null);

  // Bloqueio form state
  const [newMatricula, setNewMatricula] = useState('');
  const [newNome, setNewNome] = useState('');
  const [newMotivo, setNewMotivo] = useState('ASO Periódico Vencido');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = keyword.trim().toLowerCase();
    if (cleanKey === 'salobo2026' || cleanKey === 'admin' || cleanKey === 'salobo') {
      setIsUnlocked(true);
      setErrorMsg(null);
    } else {
      setErrorMsg('Palavra-chave incorreta.');
    }
  };

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatricula.trim() || !newNome.trim()) return;

    onAddBlock({
      matricula: newMatricula.trim(),
      nome: newNome.trim(),
      motivo: newMotivo,
      dataBloqueio: new Date().toISOString().split('T')[0],
    });

    setNewMatricula('');
    setNewNome('');
    setShowAddForm(false);
  };

  const handleExtraTurnoChange = (newTurno: Turno) => {
    setExtraTurno(newTurno);
    if (newTurno === 'Dia') {
      if (extraHorario !== '05h' && extraHorario !== '08h' && extraHorario !== '09h') {
        setExtraHorario('08h');
      }
    } else {
      if (extraHorario !== '17h' && extraHorario !== '20h') {
        setExtraHorario('17h');
      }
    }
  };

  // Submit extra participant (forces beyond limits)
  const handleExtraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExtraErrorMsg(null);
    setExtraSuccessMsg(null);

    const cleanMatricula = extraMatricula.trim();
    const cleanNome = extraNome.trim();
    const cleanEmail = extraEmail.trim();
    const cleanFuncao = extraFuncao.trim();

    if (!cleanMatricula || !cleanNome || !cleanEmail || !cleanFuncao) {
      setExtraErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Check if already registered on the exact same date & slot
    const alreadyRegistered = participants.some(
      (p) =>
        p.matricula === cleanMatricula &&
        p.data === extraData &&
        p.horario === extraHorario &&
        p.status === 'confirmado'
    );

    if (alreadyRegistered) {
      setExtraErrorMsg(
        `O colaborador matrícula ${cleanMatricula} já está inscrito nesta mesma data (${extraData}) e horário (${extraHorario}).`
      );
      return;
    }

    // Turma Extra validation: only Tuesday (2) or Thursday (4)
    if (extraHorario === '09h') {
      const [y, m, d] = extraData.split('-').map(Number);
      const checkDate = new Date(y, m - 1, d);
      const dayOfWeek = checkDate.getDay();
      if (dayOfWeek !== 2 && dayOfWeek !== 4) {
        setExtraErrorMsg(
          'A turma extra das 09h está disponível exclusivamente para Terças e Quintas-feiras. Por favor, selecione uma data correspondente.'
        );
        return;
      }
    }

    // Call admin add handler (forces registration beyond limits)
    onAdminAddParticipant({
      matricula: cleanMatricula,
      nome: cleanNome,
      email: cleanEmail,
      funcao: cleanFuncao,
      tipoVeiculo: extraTipoVeiculo.trim() || 'Não informado',
      data: extraData,
      turno: extraTurno,
      horario: extraHorario,
    });

    setExtraSuccessMsg(
      `Inscrição extraordinária de "${cleanNome}" (Matrícula: ${cleanMatricula}) realizada com sucesso na turma ${extraTurno} - ${extraHorario} do dia ${extraData.split('-').reverse().join('/')}!`
    );

    // Reset inputs
    setExtraMatricula('');
    setExtraNome('');
    setExtraEmail('');
    setExtraFuncao('');
    setExtraTipoVeiculo('');

    setTimeout(() => {
      setExtraSuccessMsg(null);
    }, 6000);
  };

  const handleConfirmRemove = (id: string, nome: string) => {
    onRemoveParticipant(id);
    setConfirmDeleteId(null);
    setActionFeedback(`Inscrição de "${nome}" foi retirada e a vaga foi liberada no sistema.`);
    setTimeout(() => {
      setActionFeedback(null);
    }, 4000);
  };

  // Filter participants for "Retirar Inscritos"
  const filteredParticipants = participants.filter((p) => {
    const matchQuery =
      searchQuery === '' ||
      p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.matricula.includes(searchQuery) ||
      p.funcao.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDate = filterDate === 'todas' || p.data === filterDate;

    return matchQuery && matchDate;
  });

  // Extract unique dates for filter dropdown with strict string[] type
  const uniqueDates: string[] = Array.from(new Set<string>(participants.map((p) => p.data))).sort();

  // Check if extra matricula is blocked
  const isExtraMatriculaBlocked = blockedList.find(
    (b) => b.matricula === extraMatricula.trim()
  );

  const exportCSV = () => {
    const headers = ['Matricula', 'Nome', 'Email', 'Funcao', 'TipoVeiculo', 'Data', 'Turno', 'Horario', 'CodigoAutenticacao'];
    const rows = participants.map((p) => [
      p.matricula,
      `"${p.nome}"`,
      p.email,
      `"${p.funcao}"`,
      `"${p.tipoVeiculo || 'Não informado'}"`,
      p.data,
      p.turno,
      p.horario,
      p.codigoAutenticacao,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `inscritos_mao_inglesa_salobo_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBackupJSON = () => {
    const now = new Date();
    const backupData = {
      sistema: 'Treinamento Prático Mão Inglesa - Salobo Metais',
      versao: '1.0',
      dataExportacao: now.toISOString(),
      estatisticas: {
        totalInscritos: participants.length,
        totalBloqueios: blockedList.length,
      },
      participantes: participants,
      bloqueios: blockedList,
      configuracaoBanner: bannerConfig,
    };

    const jsonString =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    const dateFormatted = now.toISOString().slice(0, 10);
    const timeFormatted = now.toTimeString().slice(0, 8).replace(/:/g, '-');
    downloadAnchor.setAttribute(
      'download',
      `backup_salobo_mao_inglesa_${dateFormatted}_${timeFormatted}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-start gap-3 mb-2">
        <div className="p-2 rounded-xl bg-[#ffdad6] text-[#ba1a1a] shrink-0">
          {isUnlocked ? <Unlock className="w-5 h-5 text-emerald-700" /> : <Lock className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase block">
            Controle Restrito
          </span>
          <h2 className="text-base sm:text-lg font-bold text-[#0f2439] leading-tight">
            Área do administrador
          </h2>
        </div>
        {isUnlocked && (
          <button
            type="button"
            onClick={() => setIsUnlocked(false)}
            className="text-xs text-slate-500 hover:text-red-700 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
          >
            Bloquear painel
          </button>
        )}
      </div>

      <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
        {isUnlocked
          ? 'Painel administrativo ativo: retire inscrições existentes, adicione vagas extras além dos limites normais, gerencie bloqueios e exporte relatórios.'
          : 'As opções administrativas de gestão de vagas, cancelamentos e bloqueios permanecem protegidas por palavra-chave institucional.'}
      </p>

      {!isUnlocked ? (
        <form onSubmit={handleUnlock} className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Palavra-chave
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite a palavra-chave"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2439] focus:border-transparent bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && <p className="text-xs text-red-600 font-medium">{errorMsg}</p>}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="h-11 px-5 rounded-xl bg-[#000e1e] hover:bg-[#0f2439] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Acessar Painel do Administrador</span>
            </button>
          </div>
        </form>
      ) : (
        /* Unlocked Admin Dashboard */
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <div className="flex items-center gap-2 text-emerald-900 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Acesso administrativo autorizado • Salobo Metais</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-800 font-bold">
              {participants.length} inscritos ativos
            </span>
          </div>

          {/* Feedback banner */}
          {actionFeedback && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('retirar')}
              className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'retirar'
                  ? 'bg-white text-red-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <UserMinus className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Retirar Inscritos</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono">
                {participants.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('incluir_extra')}
              className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'incluir_extra'
                  ? 'bg-[#0f2439] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
              <span className="truncate">Incluir Vaga Extra</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bloqueios')}
              className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'bloqueios'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span className="truncate">Bloqueios</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono">
                {blockedList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exportacoes')}
              className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'exportacoes'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Download className="w-3.5 h-3.5 shrink-0 text-blue-600" />
              <span className="truncate">Exportações & Backup</span>
            </button>
          </div>

          {/* TAB 1: RETIRAR INSCRITOS */}
          {activeTab === 'retirar' && (
            <div className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <UserMinus className="w-4 h-4 text-red-600" />
                    Gerenciar e Retirar Inscritos
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Localize e cancele qualquer inscrição para liberar a vaga imediatamente no sistema.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-600">
                  Mostrando {filteredParticipants.length} de {participants.length} inscritos
                </span>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="relative sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Buscar por nome, matrícula ou função..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-9 pr-14 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0f2439] bg-white"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <div>
                  <select
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0f2439] bg-white font-medium text-slate-800"
                  >
                    <option value="todas">Todas as Datas</option>
                    {uniqueDates.map((date) => (
                      <option key={date} value={date}>
                        {date.split('-').reverse().join('/')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Participants list */}
              {filteredParticipants.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <UserX className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 font-medium">
                    Nenhum participante encontrado com os filtros informados.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {filteredParticipants.map((p) => {
                    const isDeleting = confirmDeleteId === p.id;

                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-xl border transition-all text-xs ${
                          isDeleting
                            ? 'bg-red-50 border-red-300 ring-2 ring-red-200'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                {p.nome}
                              </span>
                              <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                                Matrícula: {p.matricula}
                              </span>
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  p.turno === 'Dia'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                }`}
                              >
                                {p.turno} • {p.horario}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500 text-[11px]">
                              <span className="flex items-center gap-1 font-medium text-slate-700">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {p.data.split('-').reverse().join('/')}
                              </span>
                              <span className="flex items-center gap-1 font-medium text-slate-700">
                                <Briefcase className="w-3 h-3 text-slate-400" />
                                {p.funcao}
                              </span>
                              {p.tipoVeiculo && (
                                <span className="flex items-center gap-1 font-medium text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                  <Truck className="w-3 h-3 text-blue-700" />
                                  {p.tipoVeiculo}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-slate-400 font-mono">
                                Código: {p.codigoAutenticacao}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="shrink-0 flex items-center gap-1.5 self-end sm:self-center">
                            {isDeleting ? (
                              <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-red-200">
                                <span className="text-[11px] font-bold text-red-700 px-1">
                                  Confirmar exclusão?
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmRemove(p.id, p.nome)}
                                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md font-bold text-[11px] transition-colors cursor-pointer"
                                >
                                  Sim, retirar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-1 text-slate-600 hover:text-slate-900 rounded-md text-[11px] transition-colors cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(p.id)}
                                className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-700 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Cancelar inscrição deste colaborador"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                <span>Retirar inscrição</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INCLUIR VAGA EXTRAORDINÁRIA (+ LIMITE) */}
          {activeTab === 'incluir_extra' && (
            <div className="space-y-3 pt-1">
              <div className="p-3 bg-gradient-to-r from-cyan-900 to-[#0f2439] text-white rounded-xl shadow-xs">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-cyan-300 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-cyan-100">
                      Inclusão Extraordinária com Autorização Administrativa
                    </h4>
                    <p className="text-[11px] text-cyan-200/90 leading-relaxed mt-0.5">
                      Esta área permite ao administrador inscrever colaboradores <strong>mesmo que a turma já tenha atingido o limite padrão de 20 vagas ou o total de 40 vagas no dia</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {extraSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{extraSuccessMsg}</span>
                </div>
              )}

              {extraErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{extraErrorMsg}</span>
                </div>
              )}

              {isExtraMatriculaBlocked && (
                <div className="p-2.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Atenção: A matrícula {extraMatricula} possui bloqueio registrado (
                    <strong>{isExtraMatriculaBlocked.motivo}</strong>). Ao confirmar abaixo, você autorizará excepcionalmente a vaga.
                  </span>
                </div>
              )}

              <form onSubmit={handleExtraSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Matrícula do Colaborador *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 884102"
                      value={extraMatricula}
                      onChange={(e) => setExtraMatricula(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0f2439] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nome do colaborador"
                      value={extraNome}
                      onChange={(e) => setExtraNome(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0f2439] bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="colaborador@empresa.com"
                      value={extraEmail}
                      onChange={(e) => setExtraEmail(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0f2439] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Função *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Operador de Equipamentos Pesados"
                      value={extraFuncao}
                      onChange={(e) => setExtraFuncao(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0f2439] bg-white"
                    />
                  </div>
                </div>

                {/* Tipo de Veículo */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-700" />
                    <span>Tipo de Veículo</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Caminhão Fora de Estrada, Hilux, Trator de Esteira..."
                    value={extraTipoVeiculo}
                    onChange={(e) => setExtraTipoVeiculo(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0f2439] bg-white font-medium text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Data do Treinamento *
                    </label>
                    <input
                      type="date"
                      required
                      value={extraData}
                      onChange={(e) => setExtraData(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0f2439] bg-white text-slate-800"
                    />
                    {extraHorario === '09h' && (
                      <span className="text-[10px] text-cyan-700 font-bold block mt-1">
                        * Turmas extras (09h): apenas terças e quintas
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Turno *
                    </label>
                    <select
                      value={extraTurno}
                      onChange={(e) => handleExtraTurnoChange(e.target.value as Turno)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0f2439] bg-white text-slate-800 font-medium"
                    >
                      <option value="Dia">Dia</option>
                      <option value="Noite">Noite</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Horário *
                    </label>
                    <select
                      value={extraHorario}
                      onChange={(e) => setExtraHorario(e.target.value as Horario)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0f2439] bg-white text-slate-800 font-medium"
                    >
                      {extraTurno === 'Dia' ? (
                        <>
                          <option value="05h">05h</option>
                          <option value="08h">08h</option>
                          <option value="09h">09h (Turma Extra)</option>
                        </>
                      ) : (
                        <>
                          <option value="17h">17h</option>
                          <option value="20h">20h</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">
                    * A vaga será confirmada imediatamente sem validação restritiva de capacidade.
                  </span>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-[#0f2439] hover:bg-[#1a3a5a] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-xs cursor-pointer self-end sm:self-center"
                  >
                    <UserPlus className="w-4 h-4 text-cyan-400" />
                    <span>Confirmar Inclusão Extraordinária</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: BLOQUEIOS PREVENTIVOS */}
          {activeTab === 'bloqueios' && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Matrículas com Bloqueio Preventivo ({blockedList.length})
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Colaboradores listados aqui são impedidos de se inscrever pelo formulário público.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddForm ? 'Cancelar' : 'Adicionar Bloqueio'}
                </button>
              </div>

              {/* Add new block form */}
              {showAddForm && (
                <form
                  onSubmit={handleCreateBlock}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5"
                >
                  <span className="text-xs font-bold text-slate-800 block">
                    Cadastrar Bloqueio Preventivo
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Matrícula (ex: 882012)"
                      value={newMatricula}
                      onChange={(e) => setNewMatricula(e.target.value)}
                      required
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Nome do colaborador"
                      value={newNome}
                      onChange={(e) => setNewNome(e.target.value)}
                      required
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Motivo (ex: ASO vencido, CNH suspensa)"
                    value={newMotivo}
                    onChange={(e) => setNewMotivo(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1 text-xs text-slate-600 cursor-pointer"
                    >
                      Fechar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 cursor-pointer"
                    >
                      Confirmar Bloqueio
                    </button>
                  </div>
                </form>
              )}

              {blockedList.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                  Nenhuma matrícula com bloqueio ativo no momento.
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {blockedList.map((item) => (
                    <div
                      key={item.matricula}
                      className="p-3 rounded-xl border border-red-100 bg-red-50/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-red-950 bg-red-100 px-1.5 py-0.5 rounded">
                            {item.matricula}
                          </span>
                          <span className="font-bold text-slate-900">{item.nome}</span>
                        </div>
                        <p className="text-red-700 mt-1">{item.motivo}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onUnblock(item.matricula)}
                        className="shrink-0 px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 rounded-lg font-medium transition-colors text-[11px] cursor-pointer"
                        title="Liberar para inscrição"
                      >
                        Desbloquear
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EXPORTAÇÕES & BACKUP */}
          {activeTab === 'exportacoes' && (
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-blue-600" />
                Ações Rápidas, Relatórios e Backups
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={onOpenDirectLinkModal}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div>
                    <span className="text-xs font-bold text-[#0f2439] block">
                      Link Direto da Imagem
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {bannerConfig.mode === 'custom-url' ? 'URL customizada ativa' : 'Banner oficial padrão'}
                    </span>
                  </div>
                  <ImageIcon className="w-4 h-4 text-cyan-700 shrink-0 ml-1" />
                </button>

                <button
                  type="button"
                  onClick={exportCSV}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div>
                    <span className="text-xs font-bold text-[#0f2439] block">
                      Exportar Inscritos (CSV)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Planilha Excel / Sheets ({participants.length} inscritos)
                    </span>
                  </div>
                  <Download className="w-4 h-4 text-emerald-700 shrink-0 ml-1" />
                </button>

                <button
                  type="button"
                  onClick={exportBackupJSON}
                  title="Baixar backup manual em formato JSON com todos os inscritos e bloqueios"
                  className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/50 hover:bg-amber-100/60 text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div>
                    <span className="text-xs font-bold text-amber-950 block">
                      Backup Manual (JSON)
                    </span>
                    <span className="text-[11px] text-amber-700">
                      {participants.length} inscritos e {blockedList.length} bloqueios
                    </span>
                  </div>
                  <FileJson className="w-4 h-4 text-amber-700 shrink-0 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
