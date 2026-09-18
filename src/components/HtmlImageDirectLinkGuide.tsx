import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, Image as ImageIcon, Sparkles, AlertTriangle, Code2 } from 'lucide-react';
import { SAMPLE_IMAGE_LINKS } from '../data/initialData';

interface HtmlImageDirectLinkGuideProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onApplyUrl: (url: string) => void;
}

export const HtmlImageDirectLinkGuide: React.FC<HtmlImageDirectLinkGuideProps> = ({
  isOpen,
  onClose,
  currentUrl,
  onApplyUrl,
}) => {
  const [testUrl, setTestUrl] = useState(currentUrl || '');
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const htmlCodeSnippet = `<img 
  src="${testUrl || 'https://link-direto-da-sua-imagem.com/foto.jpg'}" 
  alt="Treinamento Mão Inglesa - Mina do Salobo" 
  class="w-full rounded-2xl shadow-lg"
/>`;

  const reactCodeSnippet = `<img 
  src={imageUrl} 
  alt="Mão Inglesa" 
  className="w-full h-auto object-cover rounded-xl"
  referrerPolicy="no-referrer"
/>`;

  const handleTestImage = (url: string) => {
    setTestUrl(url);
    if (!url.trim()) {
      setTestStatus('idle');
      return;
    }
    setTestStatus('loading');
    const img = new Image();
    img.onload = () => setTestStatus('success');
    img.onerror = () => setTestStatus('error');
    img.src = url;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlCodeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (testUrl.trim()) {
      onApplyUrl(testUrl.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f2439]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-[#f8fafc] rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#0f2439] text-white">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0f2439]">
                Links Diretos para Imagens no HTML
              </h3>
              <p className="text-xs text-slate-500">
                Como funciona a inserção direta de imagens via tag &lt;img&gt;
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Direct answer box */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-sm">
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded bg-emerald-600 text-white mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <strong className="block font-bold text-emerald-900 text-base mb-1">
                  Sim! É totalmente possível e nativo do HTML.
                </strong>
                <p className="text-emerald-800 text-xs sm:text-sm leading-relaxed">
                  Para exibir qualquer imagem na web ou no seu código, basta apontar o atributo{' '}
                  <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900">
                    src="..."
                  </code>{' '}
                  para a <strong>URL direta</strong> do arquivo (terminando em .jpg, .png, .webp, .svg) ou hospedada em uma CDN/servidor.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive URL Tester & Banner Updater */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Inserir Imagem Original ou Link Direto
              </label>
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-800 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-md transition-all hover:bg-cyan-100">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Escolher Arquivo do Computador</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const dataUrl = ev.target?.result as string;
                        if (dataUrl) {
                          setTestUrl(dataUrl);
                          setTestStatus('success');
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="https://exemplo.com/imagem.jpg ou use o botão para escolher arquivo"
                  value={testUrl.startsWith('data:') ? '[Arquivo de imagem selecionado localmente]' : testUrl}
                  onChange={(e) => handleTestImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2439] focus:border-transparent font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleApply}
                disabled={!testUrl.trim()}
                className="px-4 py-2 rounded-lg bg-[#0f2439] hover:bg-[#1e293b] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Aplicar no Banner
              </button>
            </div>

            {/* Test Status feedback */}
            {testStatus === 'loading' && (
              <p className="text-xs text-slate-500 animate-pulse flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                Carregando imagem de teste...
              </p>
            )}
            {testStatus === 'success' && (
              <div className="p-2.5 rounded-lg bg-emerald-100/70 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Link direto válido! Imagem carregada com sucesso.
                </span>
                <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded shadow-2xs">HTTP 200 OK</span>
              </div>
            )}
            {testStatus === 'error' && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>
                  Não foi possível carregar a imagem. Verifique se a URL é direta (terminando em extensão de imagem ou liberada por CORS).
                </span>
              </div>
            )}

            {/* Presets to quickly test */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-600 block mb-1.5">
                Exemplos de links diretos de alta resolução para testar:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_IMAGE_LINKS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTestImage(item.url)}
                    className="text-xs bg-white border border-slate-200 hover:border-slate-400 text-slate-700 px-2.5 py-1 rounded-md transition-colors text-left"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* HTML & React Code Examples with Copy Button */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Sintaxe no HTML puro:
              </h4>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0f2439] hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar Código HTML'}
              </button>
            </div>

            <pre className="p-3 bg-[#0a192f] text-cyan-300 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800">
              <code>{htmlCodeSnippet}</code>
            </pre>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pt-1">
              2. Como funciona no React / JSX:
            </h4>
            <pre className="p-3 bg-[#0a192f] text-emerald-300 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800">
              <code>{reactCodeSnippet}</code>
            </pre>
          </div>

          {/* Important tips */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800">Dicas para o link direto funcionar:</div>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <strong>Link Direto vs Link de Página:</strong> Use o link que termina no arquivo (ex: <code className="text-slate-800 font-mono">.jpg</code>, <code className="text-slate-800 font-mono">.png</code>), e não o link da página do navegador (como página de busca do Google).
              </li>
              <li>
                <strong>Hospedagem Corporativa / Intranet:</strong> Na Vale ou qualquer servidor corporativo, imagens salvas na pasta pública (ex: <code className="text-slate-800 font-mono">/public/assets/banner.jpg</code>) podem ser referenciadas diretamente como <code className="text-slate-800 font-mono">src="/assets/banner.jpg"</code>.
              </li>
              <li>
                <strong>Atributo Alt:</strong> Sempre defina o atributo <code className="text-slate-800 font-mono">alt="..."</code> para acessibilidade e leitores de tela de segurança.
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-[#f8fafc] rounded-b-2xl flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#0f2439] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1e293b]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
