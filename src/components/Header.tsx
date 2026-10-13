import React from 'react';
import { Phone, MapPin } from 'lucide-react';
import { TeamLogicLogo, TeamLogicBrandBar } from './TeamLogicLogo';

interface HeaderProps {
  onSelectPreset?: (url: string, industry: string) => void;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Corporate Utility Bar */}
      <div className="bg-[#00502C] text-white text-xs px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-end">
        <div className="flex items-center gap-4 text-[11px] text-emerald-200 font-medium">
          <a
            href="tel:5134459002"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3 text-[#8CC63F]" />
            <span>513-445-9002</span>
          </a>
          <a
            href="https://teamlogicit.com/locations"
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1 hover:text-white transition-colors"
          >
            <MapPin className="w-3 h-3 text-[#8CC63F]" />
            <span>Cincinnati Ohio</span>
          </a>
          <span className="bg-[#008752] text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">
            FREE AUDITOR
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[5rem] sm:min-h-[5.5rem] md:min-h-[6rem] py-2 sm:py-3 flex flex-row items-center justify-between gap-4">
        {/* Brand Logo in top left corner */}
        <div className="flex items-center shrink-0">
          <a href="/" className="flex items-center hover:opacity-95 transition-opacity py-0.5" title="TeamLogic IT">
            <TeamLogicLogo variant="vertical" className="h-14 sm:h-16 md:h-18 lg:h-20 w-auto object-contain" />
          </a>
        </div>

        {/* Right Side Brand Text */}
        <div className="text-right flex items-center">
          <span className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-extrabold text-black tracking-tight leading-tight font-inter sm:whitespace-nowrap">
            TeamLogic IT - Your Technology Partner
          </span>
        </div>
      </div>

      {/* TeamLogic IT Signature 5-Color Brand Bar */}
      <TeamLogicBrandBar className="h-1.5" />
    </header>
  );
};
