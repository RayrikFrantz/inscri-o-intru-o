import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Users,
  Shield,
  HelpCircle,
  Image as ImageIcon,
  Check,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import { Participant, Turno, Horario, BlockedMatricula, BannerSettings } from './types';
import { INITIAL_PARTICIPANTS, INITIAL_BLOCKED } from './data/initialData';
import { MaoInglesaBanner } from './components/MaoInglesaBanner';
import { TurmasStatusGrid } from './components/TurmasStatusGrid';
import { InscricaoForm } from './components/InscricaoForm';
import { AdminArea } from './components/AdminArea';
import { ConsultarInscritos } from './components/ConsultarInscritos';
import { ComprovanteModal } from './components/ComprovanteModal';
import { HtmlImageDirectLinkGuide } from './components/HtmlImageDirectLinkGuide';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { TurmaExtraAdmSection } from './components/TurmaExtraAdmSection';

export default function App() {
  // Persistence state
  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem('salobo_participants_2026');
    if (saved) {
      try {
        const parsed: Participant[] = JSON.parse(saved);
        // Include initial seeds for extra classes if not present yet
        const missingSeeds = INITIAL_PARTICIPANTS.filter(
          (init) => !parsed.some((p) => p.matricula === init.matricula && p.data === init.data && p.horario === init.horario)
        );
        return [...missingSeeds, ...parsed];
      } catch (e) {
        console.error('Failed to parse saved participants', e);
      }
    }
    return INITIAL_PARTICIPANTS;
  });

  const [blockedList, setBlockedList] = useState<BlockedMatricula[]>(() => {
    const saved = localStorage.getItem('salobo_blocked_2026');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved blocked', e);
      }
    }
    return INITIAL_BLOCKED;
  });

  const [bannerConfig, setBannerConfig] = useState<BannerSettings>(() => {
    const saved = localStorage.getItem('salobo_banner_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse banner config', e);
      }
    }
    return {
      mode: 'default',
      customUrl: '',
      altText: 'Treinamento Mão Inglesa 2026 - Mina do Salobo',
    };
  });

  // Active form selectors
  const [selectedData, setSelectedData] = useState<string>('2026-09-21');
  const [selectedTurno, setSelectedTurno] = useState<Turno>('Noite');
  const [selectedHorario, setSelectedHorario] = useState<Horario>('17h');

  // Modals & Drawers
  const [activeCredential, setActiveCredential] = useState<Participant | null>(null);
  const [isDirectLinkModalOpen, setIsDirectLinkModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('salobo_participants_2026', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('salobo_blocked_2026', JSON.stringify(blockedList));
  }, [blockedList]);

  useEffect(() => {
    localStorage.setItem('salobo_banner_config', JSON.stringify(bannerConfig));
  }, [bannerConfig]);

  // Total confirmed participants on selected date
  const totalConfirmedDate = participants.filter(
    (p) => p.data === selectedData && p.status === 'confirmado'
  ).length;

  const totalMaxCapacityDate = 40; // 40 vagas por dia
  const progressPercentage = Math.min(100, Math.round((totalConfirmedDate / totalMaxCapacityDate) * 100));

  // Calculate dynamic slot statistics for selected date (20 por horário, máx 40 no total do dia)
  const getSlotStats = (turno: Turno, horario: Horario) => {
    const capacity = 20;
    const enrolledCount = participants.filter(
      (p) => p.data === selectedData && p.turno === turno && p.horario === horario && p.status === 'confirmado'
    ).length;
    const dayRemaining = Math.max(0, totalMaxCapacityDate - totalConfirmedDate);
    const slotRemaining = Math.max(0, capacity - enrolledCount);
    return {
      count: enrolledCount,
      capacity,
      remaining: Math.min(slotRemaining, dayRemaining),
    };
  };

  // Handler to register new participant
  const handleRegisterParticipant = (
    data: Omit<Participant, 'id' | 'codigoAutenticacao' | 'dataCadastro' | 'status'>
  ): boolean => {
    const newAuthCode = `SLB-2026-${data.horario.toUpperCase()}-${data.matricula.slice(-4)}`;
    const newParticipant: Participant = {
      ...data,
      id: `part-${Date.now()}`,
      codigoAutenticacao: newAuthCode,
      dataCadastro: new Date().toISOString(),
      status: 'confirmado',
    };

    setParticipants((prev) => [newParticipant, ...prev]);
    setActiveCredential(newParticipant);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
    return true;
  };

  // Handler for admin to remove an enrolled participant
  const handleRemoveParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  // Handler for admin to force enroll beyond limits (extra slot)
  const handleAdminAddParticipant = (
    data: Omit<Participant, 'id' | 'codigoAutenticacao' | 'dataCadastro' | 'status'>
  ): boolean => {
    const newAuthCode = `SLB-ADM-${data.horario.toUpperCase()}-${data.matricula.slice(-4)}`;
    const newParticipant: Participant = {
      ...data,
      id: `part-adm-${Date.now()}`,
      codigoAutenticacao: newAuthCode,
      dataCadastro: new Date().toISOString(),
      status: 'confirmado',
    };

    setParticipants((prev) => [newParticipant, ...prev]);
    setActiveCredential(newParticipant);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
    return true;
  };

  // Handler to unblock matrícula
  const handleUnblock = (matricula: string) => {
    setBlockedList((prev) => prev.filter((b) => b.matricula !== matricula));
  };

  // Handler to add block
  const handleAddBlock = (newBlock: BlockedMatricula) => {
    setBlockedList((prev) => [newBlock, ...prev]);
  };

  // Banner Direct Link Handlers
  const handleApplyCustomImageUrl = (url: string) => {
    setBannerConfig({
      mode: 'custom-url',
      customUrl: url,
      altText: 'Treinamento Mão Inglesa - Mina do Salobo',
    });
  };

  const handleResetBanner = () => {
    setBannerConfig({
      mode: 'default',
      customUrl: '',
      altText: 'Treinamento Mão Inglesa - Mina do Salobo',
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0b1c30] flex flex-col items-center">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 z-50 bg-[#000e1e] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-500/50 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs sm:text-sm font-semibold">
            Inscrição confirmada com sucesso! Comprovante gerado.
          </span>
        </div>
      )}

      {/* Main Container - max-w-md / max-w-lg for mobile/desktop precision */}
      <div className="w-full max-w-xl px-3 sm:px-4 py-3 sm:py-5 space-y-4">
        {/* Cabeçalho Principal (Header) com a Imagem Oficial da Mão Inglesa */}
        <header id="cabecalho-principal" className="space-y-2.5">
          {/* Barra utilitária superior com identificação e avisos */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Treinamento Mão Inglesa 2026
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(true)}
                className="p-1.5 rounded-xl text-slate-600 hover:text-[#0f2439] hover:bg-slate-200/60 transition-colors relative cursor-pointer"
                title="Avisos e comunicados operacionais"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </button>
            </div>
          </div>

          {/* Imagem Oficial no Cabeçalho */}
          <MaoInglesaBanner
            bannerConfig={bannerConfig}
          />
        </header>

        {/* Badges & Title Block matching Image 4 */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* COMPLEXO SALOBO Badge with green check */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#000e1e] text-white shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Complexo Salobo
            </span>

            {/* OPERAÇÃO SEGURA Badge */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100/90 text-emerald-900 border border-emerald-300">
              Operação Segura
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#0f2439] tracking-tight leading-tight">
            Mina do Salobo: Inscrições Mão Inglesa
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Treinamento mandatório e prático para operadores de equipamentos pesados e condutores credenciados de veículos leves em pista invertida na Mina do Salobo.
          </p>
        </div>

        {/* Total Confirmado Card matching Image 4 */}
        <div className="bg-[#000e1e] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Total Confirmado</span>
            </div>
            {/* Verified icon in green circle */}
            <div className="w-7 h-7 rounded-lg bg-emerald-900/60 text-emerald-400 border border-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                {totalConfirmedDate}
              </span>
              <span className="text-xs sm:text-sm text-slate-300 font-medium">
                de 40 vagas no dia
              </span>
            </div>
            <span className="text-xs font-semibold text-cyan-300 font-mono">
              {Math.max(0, totalMaxCapacityDate - totalConfirmedDate)} livres
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(8, progressPercentage)}%` }}
            />
          </div>
        </div>

        {/* VAGAS POR TURMA (2x2 Grid + Selector) matching Image 4 */}
        <TurmasStatusGrid
          selectedTurno={selectedTurno}
          selectedHorario={selectedHorario}
          onSelectTurma={(turno, horario) => {
            setSelectedTurno(turno);
            setSelectedHorario(horario);
          }}
          getSlotStats={getSlotStats}
        />

        {/* DADOS PARA INSCRIÇÃO (Formulário) matching Image 4 */}
        <InscricaoForm
          selectedData={selectedData}
          selectedTurno={selectedTurno}
          selectedHorario={selectedHorario}
          onDataChange={setSelectedData}
          onTurnoChange={setSelectedTurno}
          onHorarioChange={setSelectedHorario}
          getSlotStats={getSlotStats}
          blockedList={blockedList}
          existingParticipants={participants}
          onSubmitInscricao={handleRegisterParticipant}
        />

        {/* TURMAS EXTRAS DE ADM (Terça e Quinta às 09h) - Posicionado abaixo das Inscrições */}
        <TurmaExtraAdmSection
          participants={participants}
          blockedList={blockedList}
          onRegisterParticipant={handleRegisterParticipant}
          onViewComprovante={(p) => setActiveCredential(p)}
        />

        {/* CONTROLE RESTRITO - Área do administrador matching Image 4 */}
        <AdminArea
          blockedList={blockedList}
          onUnblock={handleUnblock}
          onAddBlock={handleAddBlock}
          onOpenDirectLinkModal={() => setIsDirectLinkModalOpen(true)}
          participants={participants}
          bannerConfig={bannerConfig}
          onRemoveParticipant={handleRemoveParticipant}
          onAdminAddParticipant={handleAdminAddParticipant}
        />

        {/* CONSULTAR INSCRITOS POR DATA matching Image 4 */}
        <ConsultarInscritos
          participants={participants}
          selectedDate={selectedData}
          onDateChange={setSelectedData}
          onViewComprovante={(p) => setActiveCredential(p)}
        />

        {/* Direct HTML Image Link Educational Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-200/70 p-4 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#0f2439] text-white shrink-0 mt-0.5">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-[#0f2439] text-xs sm:text-sm">
              Dúvida: &quot;É possível adicionar links diretos para as imagens do HTML?&quot;
            </h4>
            <p className="text-slate-600 mt-1 leading-relaxed">
              <strong>Sim!</strong> O HTML permite links diretos via tag{' '}
              <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono text-blue-900 font-bold">
                &lt;img src=&quot;https://...&quot; /&gt;
              </code>
              . Você pode testar qualquer link direto de imagem na web e aplicá-lo instantaneamente ao topo desta aplicação.
            </p>
            <button
              type="button"
              onClick={() => setIsDirectLinkModalOpen(true)}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f2439] hover:bg-[#1e293b] text-white font-bold text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Abrir Gerenciador de Link Direto</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-slate-500 space-y-1">
          <p className="font-medium">
            Complexo Salobo • Diretoria de Operações e Mineração • Vale S.A.
          </p>
          <p className="text-[11px] text-slate-400">
            Padrão Operacional PO-SAL-MIN-2026: Circulação em Mão Inglesa em Vias Internas
          </p>
        </footer>
      </div>

      {/* Modals & Slide-Overs */}
      <ComprovanteModal
        participant={activeCredential}
        onClose={() => setActiveCredential(null)}
      />

      <HtmlImageDirectLinkGuide
        isOpen={isDirectLinkModalOpen}
        onClose={() => setIsDirectLinkModalOpen(false)}
        currentUrl={bannerConfig.customUrl}
        onApplyUrl={handleApplyCustomImageUrl}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
