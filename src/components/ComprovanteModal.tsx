import React, { useRef } from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Download, Share2, Calendar, MapPin, Clock, Award, Truck } from 'lucide-react';
import { Participant } from '../types';

interface ComprovanteModalProps {
  participant: Participant | null;
  onClose: () => void;
}

export const ComprovanteModal: React.FC<ComprovanteModalProps> = ({ participant, onClose }) => {
  if (!participant) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0f2439]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#000e1e] text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Comprovante Oficial de Inscrição
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Voucher Area */}
        <div className="p-5 overflow-y-auto space-y-4 print:p-0">
          <div className="relative border-2 border-[#0f2439]/20 rounded-2xl bg-gradient-to-b from-[#f8fafc] to-white p-5 shadow-xs overflow-hidden">
            {/* Watermark institutional seal */}
            <div className="absolute right-[-20px] bottom-[-20px] text-slate-100 font-black text-7xl select-none pointer-events-none opacity-40">
              VALE
            </div>

            {/* Header Voucher */}
            <div className="flex items-start justify-between border-b border-dashed border-slate-300 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                  Credenciamento Aprovado
                </span>
                <h3 className="text-lg font-black text-[#0f2439] mt-1 tracking-tight">
                  TREINAMENTO MÃO INGLESA 2026
                </h3>
                <p className="text-xs font-medium text-slate-600">
                  Instrução Prática & Teórica em Pista Invertida • Complexo Salobo
                </p>
              </div>

              {/* Minimal Vale symbol */}
              <div className="w-10 h-10 bg-[#000e1e] rounded-xl flex items-center justify-center text-white font-extrabold text-xs">
                VALE
              </div>
            </div>

            {/* Participant Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Colaborador</span>
                <span className="font-bold text-slate-900 text-sm">{participant.nome}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Matrícula</span>
                <span className="font-mono font-bold text-slate-900 text-sm bg-slate-100 px-2 py-0.5 rounded inline-block">
                  {participant.matricula}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Função / Cargo</span>
                <span className="font-medium text-slate-800">{participant.funcao}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Veículo / Operação</span>
                <span className="font-semibold text-cyan-900 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                  <span className="truncate">{participant.tipoVeiculo || 'Não especificado'}</span>
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">E-mail Cadastrado</span>
                <span className="font-mono text-slate-700 truncate block">{participant.email}</span>
              </div>
            </div>

            {/* Shift & Time highlighted banner */}
            <div className="bg-[#eff4ff] border border-blue-200 rounded-xl p-3 grid grid-cols-3 gap-2 text-center mb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-900 uppercase block">Data</span>
                <span className="text-xs sm:text-sm font-bold text-[#0f2439]">{participant.data}</span>
              </div>
              <div className="border-x border-blue-200">
                <span className="text-[10px] font-bold text-blue-900 uppercase block">Turno</span>
                <span className="text-xs sm:text-sm font-bold text-[#0f2439]">{participant.turno}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-900 uppercase block">Horário</span>
                <span className="text-xs sm:text-sm font-black text-blue-700">{participant.horario}</span>
              </div>
            </div>

            {/* Perforated Divider */}
            <div className="relative border-t-2 border-dashed border-slate-300 my-4 -mx-5 px-5 flex items-center justify-between">
              <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-white border-r border-slate-300" />
              <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-white border-l border-slate-300" />
            </div>

            {/* Authentication & QR Zone */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                  Autenticação Digital
                </span>
                <span className="font-mono font-bold text-xs text-[#0f2439] tracking-wider block">
                  {participant.codigoAutenticacao}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Apresentar crachá e CNH no portão operacional.
                </span>
              </div>

              {/* Dynamic SVG QR Code Representation */}
              <div className="p-2 bg-white rounded-lg border border-slate-300 shadow-2xs">
                <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
                  {/* Outer corner squares */}
                  <rect x="5" y="5" width="30" height="30" rx="4" fill="#0f2439" />
                  <rect x="11" y="11" width="18" height="18" rx="2" fill="white" />
                  <rect x="15" y="15" width="10" height="10" rx="1" fill="#0f2439" />

                  <rect x="65" y="5" width="30" height="30" rx="4" fill="#0f2439" />
                  <rect x="71" y="11" width="18" height="18" rx="2" fill="white" />
                  <rect x="75" y="15" width="10" height="10" rx="1" fill="#0f2439" />

                  <rect x="5" y="65" width="30" height="30" rx="4" fill="#0f2439" />
                  <rect x="11" y="71" width="18" height="18" rx="2" fill="white" />
                  <rect x="15" y="75" width="10" height="10" rx="1" fill="#0f2439" />

                  {/* QR Data Dots */}
                  <rect x="42" y="10" width="8" height="8" rx="1" fill="#0f2439" />
                  <rect x="42" y="24" width="8" height="8" rx="1" fill="#0f2439" />
                  <rect x="52" y="18" width="6" height="6" rx="1" fill="#0f2439" />
                  <rect x="45" y="45" width="12" height="12" rx="2" fill="#0284c7" />
                  <rect x="15" y="45" width="8" height="8" rx="1" fill="#0f2439" />
                  <rect x="65" y="45" width="10" height="6" rx="1" fill="#0f2439" />
                  <rect x="78" y="55" width="12" height="8" rx="1" fill="#0f2439" />
                  <rect x="45" y="65" width="8" height="12" rx="1" fill="#0f2439" />
                  <rect x="60" y="75" width="14" height="8" rx="1" fill="#0f2439" />
                  <rect x="80" y="80" width="10" height="10" rx="1" fill="#0f2439" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-200 bg-[#f8fafc] flex items-center justify-between">
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hidden sm:flex">
            <span className="text-base leading-none">⚠️</span>
            <span>Perdeu o dia do treinamento! Aguarde uma nova Programação.</span>
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#000e1e] hover:bg-[#0f2439] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
