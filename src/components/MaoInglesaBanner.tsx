import React, { useState } from 'react';
import { BannerSettings } from '../types';
import officialBannerImg from '../assets/images/banner_mao_inglesa_1789672180240.jpg';

interface MaoInglesaBannerProps {
  bannerConfig: BannerSettings;
  onOpenDirectLinkModal?: () => void;
  onResetBanner?: () => void;
  onApplyImage?: (dataUrl: string) => void;
}

export const MaoInglesaBanner: React.FC<MaoInglesaBannerProps> = ({
  bannerConfig,
}) => {
  const [imageError, setImageError] = useState(false);

  // If user configured a custom direct image URL and it hasn't errored
  const isUsingCustomUrl = bannerConfig.mode === 'custom-url' && bannerConfig.customUrl.trim().length > 0;
  const activeImageSrc = isUsingCustomUrl && !imageError ? bannerConfig.customUrl : officialBannerImg;

  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-[#071321]">
      {/* Imagem Oficial no Cabeçalho */}
      <div className="relative w-full aspect-[16/9] max-h-[340px] sm:max-h-[380px] md:max-h-[420px] bg-slate-950 overflow-hidden flex items-center justify-center">
        <img
          src={activeImageSrc}
          alt={bannerConfig.altText || 'Banner Oficial Mão Inglesa Mina do Salobo - Vale Metais Básicos'}
          onError={() => setImageError(true)}
          className="w-full h-full object-contain sm:object-cover object-center select-none"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};


