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
import { supabase } from './lib/supabase';

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [blockedList, setBlockedList] = useState<BlockedMatricula[]>([]);
  const [bannerConfig, setBannerConfig] = useState<BannerSettings>({
    mode: 'default',
    customUrl: '',
    altText: 'Treinamento Mão Inglesa 2026 - Mina do Salobo',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Active form selectors
  const [selectedData, setSelectedData] = useState<string>('2026-09-21');
  const [selectedTurno, setSelectedTurno] = useState<Turno>('Noite');
  const [selectedHorario, setSelectedHorario] = useState<Horario>('17h');

  // Modals & Drawers
  const [activeCredential, setActiveCredential] = useState<Participant | null>(null);
  const [isDirectLinkModalOpen, setIsDirectLinkModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Fetch data from Supabase on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [participantsRes, blockedRes, bannerRes] = await Promise.all([
          supabase.from('participants').select('*'),
          supabase.from('blocked_matriculas').select('*'),
          supabase.from('banner_config').select('*').limit(1)
        ]);

        if (participantsRes.data) {
          setParticipants(participantsRes.data);
        }
        if (blockedRes.data) {
          setBlockedList(blockedRes.data);
        }
        if (bannerRes.data && bannerRes.data.length > 0) {
          setBannerConfig({
            mode: bannerRes.data[0].mode,
            customUrl: bannerRes.data[0].custom_url || '',
            altText: bannerRes.data[0].alt_text
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Total confirmed participants on selected date
  const totalConfirmedDate = participants.filter(
    (p) => p.data === selectedData && p.status === 'confirmado'
  ).length;

  const totalMaxCapacityDate = 40; // 40 vagas por dia
  const progressPercentage = Math.min(100, Math.round((totalConfirmedDate / totalMaxCapacityDate) * 100));

  // Calculate dynamic slot statistics for selected date
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
  const handleRegisterParticipant = async (
    data: Omit<Participant, 'id' | 'codigoAutenticacao' | 'dataCadastro' | 'status'>
  ): Promise<boolean> => {
    const newAuthCode = `SLB-2026-${data.horario.toUpperCase()}-${data.matricula.slice(-4)}`;
    
    // Instead of setting locally first, we insert into Supabase
    const { data: insertedData, error } = await supabase
      .from('participants')
      .insert([
        {
          matricula: data.matricula,
          nome: data.nome,
          email: data.email,
          funcao: data.funcao,
          tipo_veiculo: data.tipoVeiculo,
          data: data.data,
          turno: data.turno,
          horario: data.horario,
          codigo_autenticacao: newAuthCode,
          status: 'confirmado'
        }
      ])
      .select();

    if (error) {
      console.error("Error inserting participant:", error);
      alert("Erro ao realizar inscrição. Verifique sua conexão e tente novamente.");
      return false;
    }

    if (insertedData && insertedData.length > 0) {
      const dbParticipant = insertedData[0];
      const newParticipant: Participant = {
        ...data,
        id: dbParticipant.id,
        codigoAutenticacao: dbParticipant.codigo_autenticacao,
        dataCadastro: dbParticipant.data_cadastro,
        status: dbParticipant.status
      };

      setParticipants((prev) => [newParticipant, ...prev]);
      setActiveCredential(newParticipant);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
      return true;
    }
    return false;
  };

  // Handler for admin to remove an enrolled participant
  const handleRemoveParticipant = async (id: string) => {
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error removing participant:", error);
      alert("Erro ao remover inscrição.");
      return;
    }
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  // Handler for admin to force enroll beyond limits
  const handleAdminAddParticipant = async (
    data: Omit<Participant, 'id' | 'codigoAutenticacao' | 'dataCadastro' | 'status'>
  ): Promise<boolean> => {
    const newAuthCode = `SLB-ADM-${data.horario.toUpperCase()}-${data.matricula.slice(-4)}`;
    
    const { data: insertedData, error } = await supabase
      .from('participants')
      .insert([
        {
          matricula: data.matricula,
          nome: data.nome,
          email: data.email,
          funcao: data.funcao,
          tipo_veiculo: data.tipoVeiculo,
          data: data.data,
          turno: data.turno,
          horario: data.horario,
          codigo_autenticacao: newAuthCode,
          status: 'confirmado'
        }
      ])
      .select();

    if (error) {
      console.error("Error inserting extra participant:", error);
      alert("Erro ao inserir participante extra.");
      return false;
    }

    if (insertedData && insertedData.length > 0) {
      const dbParticipant = insertedData[0];
      const newParticipant: Participant = {
        ...data,
        id: dbParticipant.id,
        codigoAutenticacao: dbParticipant.codigo_autenticacao,
        dataCadastro: dbParticipant.data_cadastro,
        status: dbParticipant.status
      };

      setParticipants((prev) => [newParticipant, ...prev]);
      setActiveCredential(newParticipant);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
      return true;
    }
    return false;
  };

  // Handler to unblock matrícula
  const handleUnblock = async (matricula: string) => {
    const { error } = await supabase
      .from('blocked_matriculas')
      .delete()
      .eq('matricula', matricula);
      
    if (error) {
      console.error("Error unblocking:", error);
      alert("Erro ao remover bloqueio.");
      return;
    }
    setBlockedList((prev) => prev.filter((b) => b.matricula !== matricula));
  };

  // Handler to add block
  const handleAddBlock = async (newBlock: BlockedMatricula) => {
    const { error, data: insertedData } = await supabase
      .from('blocked_matriculas')
      .insert([{
        matricula: newBlock.matricula,
        nome: newBlock.nome,
        motivo: newBlock.motivo,
        data_bloqueio: newBlock.dataBloqueio
      }])
      .select();

    if (error) {
      console.error("Error adding block:", error);
      alert("Erro ao adicionar bloqueio. A matrícula já pode estar bloqueada.");
      return;
    }

    if (insertedData && insertedData.length > 0) {
      setBlockedList((prev) => [newBlock, ...prev]);
    }
  };

  // Banner Direct Link Handlers
  const handleApplyCustomImageUrl = async (url: string) => {
    const newConfig = {
      mode: 'custom-url' as const,
      customUrl: url,
      altText: 'Treinamento Mão Inglesa - Mina do Salobo',
    };
    
    // Update in Supabase
    await supabase.from('banner_config').update({
      mode: newConfig.mode,
      custom_url: newConfig.customUrl,
      alt_text: newConfig.altText
    }).eq('id', 1);

    setBannerConfig(newConfig);
  };

  const handleResetBanner = async () => {
    const newConfig = {
      mode: 'default' as const,
      customUrl: '',
      altText: 'Treinamento Mão Inglesa - Mina do Salobo',
    };

    // Update in Supabase
    await supabase.from('banner_config').update({
      mode: newConfig.mode,
      custom_url: null,
      alt_text: newConfig.altText
    }).eq('id', 1);

    setBannerConfig(newConfig);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-[#003822]">
          <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium animate-pulse">Conectando ao banco de dados...</p>
        </div>
      </div>
    );
  }

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

      {/* Header global */}
      <header className="w-full bg-gradient-to-r from-[#003822] via-[#004d2e] to-[#003822] text-white shadow-md relative overflow-hidden">
        {/* Animated pattern background */}
        <div className="absolute inset-0 opacity-10" 
             style={{ 
               backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', 
               backgroundSize: '24px 24px' 
             }}>
        </div>
        
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-4 relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/20 shadow-inner">
              <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm flex items-center gap-2">
                Trânsito Salobo
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium tracking-wide">
                  MÃO INGLESA
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium opacity-90">
                Sistema Oficial de Agendamento Operacional
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/10 transition-all rounded-lg font-medium text-sm border border-white/10 hover:border-white/30 shadow-sm backdrop-blur-sm relative group"
            >
              <Bell className="w-4 h-4 text-emerald-300 group-hover:animate-wiggle" />
              <span className="hidden sm:inline">Avisos e Dúvidas</span>
              <span className="sm:hidden">Avisos</span>
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#004d2e] items-center justify-center text-[9px] font-bold">1</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-[1200px] mx-auto px-4 py-8 sm:py-12 flex flex-col gap-10">
        
        {/* Banner Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <MaoInglesaBanner config={bannerConfig} />
        </section>

        {/* Dashboard de Vagas Global */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#003822] flex items-center gap-3">
                <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 p-1.5 bg-emerald-50 rounded-xl" />
                Disponibilidade
              </h2>
              <p className="text-slate-500 mt-2 text-sm sm:text-base flex items-center gap-2">
                Acompanhe as vagas para os próximos dias de treinamento.
              </p>
            </div>
            
            {/* Status indicators */}
            <div className="flex flex-wrap items-center gap-4 text-sm bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                <span className="font-medium text-slate-700">Vagas disponíveis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></div>
                <span className="font-medium text-slate-700">Últimas vagas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-200"></div>
                <span className="font-medium text-slate-700">Turma lotada</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              Selecione a Data do Treinamento
            </h3>
            <div className="flex flex-wrap gap-3">
              {['2026-09-21', '2026-09-22', '2026-09-23'].map((data) => (
                <button
                  key={data}
                  onClick={() => setSelectedData(data)}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm border ${
                    selectedData === data 
                      ? 'bg-[#003822] text-white border-[#003822] ring-2 ring-[#003822]/20 ring-offset-1' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  {data.split('-').reverse().join('/')}
                </button>
              ))}
            </div>
          </div>

          {/* Progresso do Dia */}
          <div className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Vagas Preenchidas no Dia ({selectedData.split('-').reverse().join('/')})
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#003822]">{totalConfirmedDate}</span>
                  <span className="text-slate-400 font-medium">/ {totalMaxCapacityDate} vagas totais no dia</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold px-3 py-1 rounded-lg ${
                  progressPercentage >= 100 ? 'bg-rose-100 text-rose-700' :
                  progressPercentage >= 80 ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {progressPercentage}%
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-1000 ease-out rounded-full ${
                  progressPercentage >= 100 ? 'bg-rose-500' :
                  progressPercentage >= 80 ? 'bg-amber-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <TurmasStatusGrid getSlotStats={getSlotStats} />
        </section>

        {/* Formulário de Inscrição */}
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

        {/* Consultar Inscrição */}
        <ConsultarInscritos 
          participants={participants} 
          onViewCredential={setActiveCredential} 
        />

        {/* Turma Extra - Visão Administrativa */}
        <TurmaExtraAdmSection 
          participants={participants}
          selectedData={selectedData}
          totalMaxCapacityDate={totalMaxCapacityDate}
        />

        {/* Área Administrativa */}
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

      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 mt-auto py-8 relative z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1200px] mx-auto px-6 text-center text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium">
            Mina do Salobo © {new Date().getFullYear()} - Sistema de Gestão de Treinamentos
          </p>
          <div className="flex items-center gap-2 text-sm font-semibold bg-emerald-50 px-3 py-1.5 rounded-full text-emerald-700 border border-emerald-100">
            <Shield className="w-4 h-4" />
            Uso Interno e Autorizado
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {activeCredential && (
        <ComprovanteModal 
          participant={activeCredential} 
          onClose={() => setActiveCredential(null)} 
        />
      )}

      {isDirectLinkModalOpen && (
        <HtmlImageDirectLinkGuide 
          onClose={() => setIsDirectLinkModalOpen(false)} 
          onApplyLink={(url) => {
            handleApplyCustomImageUrl(url);
            setIsDirectLinkModalOpen(false);
          }}
          onResetLink={() => {
            handleResetBanner();
            setIsDirectLinkModalOpen(false);
          }}
          currentMode={bannerConfig.mode}
          currentUrl={bannerConfig.customUrl}
        />
      )}

      <NotificationsDrawer 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </div>
  );
}
