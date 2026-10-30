import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  lightText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  lightText = false,
}) => {
  const iconDimensions = size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-14 h-14' : 'w-11 h-11 sm:w-12 sm:h-12';
  const titleSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-sm sm:text-base';
  const subSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[10px] sm:text-[11px]';

  return (
    <div className="flex items-center gap-2.5 shrink-0 select-none group min-w-max">
      {/* Official Academy Uploaded Logo Badge */}
      <div className={`relative ${iconDimensions} rounded-xl overflow-hidden bg-white shadow-xs border border-slate-200/90 dark:border-slate-700 p-0.5 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0`}>
        <img
          src="/assets/aistudio/image_b7a2be8f.png"
          alt="شعار أكاديمية نور وبيان"
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col text-right justify-center shrink-0 whitespace-nowrap">
          <span className={`font-extrabold tracking-tight font-display leading-tight whitespace-nowrap ${titleSize} ${lightText ? 'text-white' : 'text-[#0F2942] dark:text-white'}`}>
            أكاديمية نور وبيان
          </span>
          <span className={`font-bold tracking-normal leading-tight whitespace-nowrap ${subSize} ${lightText ? 'text-emerald-300' : 'text-[#0D9488] dark:text-emerald-400'}`}>
            فصول تفاعلية حية أونلاين 100%
          </span>
        </div>
      )}
    </div>
  );
};

