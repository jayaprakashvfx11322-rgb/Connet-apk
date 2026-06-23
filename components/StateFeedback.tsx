/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, RefreshCw, AlertCircle, LucideIcon, Compass, Sparkles } from 'lucide-react';

interface SkeletonProps {
  variant?: 'feed' | 'grid' | 'video' | 'profile' | 'messages' | 'list';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({ variant = 'feed', count = 3 }) => {
  const renderFeedSkeleton = () => (
    <div className="border border-white/5 bg-[#050914]/40 p-5 rounded-2xl flex flex-col gap-4 animate-pulse relative overflow-hidden shadow-lg w-full mb-4">
      {/* Gloss reflection shimmer */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"></div>
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/5 shrink-0"></div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 bg-white/10 rounded-full w-1/3"></div>
          <div className="h-2 bg-white/5 rounded-full w-1/4"></div>
        </div>
      </div>
      
      {/* Content lines */}
      <div className="space-y-2 mt-2">
        <div className="h-2.5 bg-white/10 rounded-full w-5/6"></div>
        <div className="h-2.5 bg-white/10 rounded-full w-full"></div>
        <div className="h-2.5 bg-[#ec4899]/5 rounded-full w-2/3"></div>
      </div>
      
      {/* Large visual spacer */}
      <div className="h-40 bg-white/5 rounded-xl mt-3 w-full border border-white/5"></div>
      
      {/* Footer footer row */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
        <div className="h-6 bg-white/5 rounded-full w-16"></div>
        <div className="h-6 bg-white/5 rounded-full w-20"></div>
        <div className="h-6 bg-[#22d3ee]/5 rounded-full w-12"></div>
      </div>
    </div>
  );

  const renderGridSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
      {Array.from({ length: 9 }).map((_, idx) => (
        <div key={idx} className="aspect-square bg-white/5 rounded-2xl border border-white/5 animate-pulse relative overflow-hidden flex flex-col justify-end p-3">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0"></div>
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-5 h-5 rounded-full bg-white/10"></div>
            <div className="h-2 bg-white/5 rounded-full w-12"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderVideoSkeleton = () => (
    <div className="flex flex-col gap-4 w-full">
      {/* Main active video player shimmer */}
      <div className="aspect-video bg-white/5 rounded-3xl border border-white/10 w-full animate-pulse relative overflow-hidden flex flex-col justify-between p-4 mb-2">
        <div className="h-4 bg-white/10 rounded-full w-32"></div>
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-full bg-white/20"></div>
          <div className="h-3 bg-white/10 rounded-full w-1/2"></div>
        </div>
      </div>
      
      {/* Other list layouts */}
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="border border-white/5 bg-[#050914]/40 p-3 rounded-2xl flex gap-3 animate-pulse">
          <div className="w-28 aspect-video bg-white/5 rounded-xl border border-white/5 shrink-0"></div>
          <div className="flex-1 flex flex-col justify-between py-1">
            <div className="flex flex-col gap-2">
              <div className="h-3 bg-white/10 rounded-full w-2/3"></div>
              <div className="h-2 bg-white/5 rounded-full w-1/2"></div>
            </div>
            <div className="h-2 bg-white/5 rounded-full w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderProfileSkeleton = () => (
    <div className="w-full flex flex-col gap-5 animate-pulse">
      {/* Banner */}
      <div className="h-36 sm:h-48 bg-white/5 rounded-3xl border border-white/10 flex items-end p-5">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 border-2 border-black -mb-12 shrink-0"></div>
      </div>
      <div className="h-10"></div>
      {/* Profile info lines */}
      <div className="flex flex-col gap-2 p-1">
        <div className="h-4 bg-white/10 rounded-full w-1/3"></div>
        <div className="h-2.5 bg-white/5 rounded-full w-1/4"></div>
        <div className="h-3 bg-white/5 rounded-full w-2/3 mt-2"></div>
      </div>
      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1.5 h-10 bg-neutral-950 rounded-xl border border-white/5"></div>
      {/* Items */}
      {renderFeedSkeleton()}
    </div>
  );

  const renderMessagesSkeleton = () => (
    <div className="w-full h-[400px] border border-white/10 bg-black rounded-3xl flex animate-pulse overflow-hidden">
      <div className="w-40 border-r border-white/5 bg-[#060a16]/65 p-3 space-y-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/5"></div>
            <div className="flex-1 h-2 bg-white/5 rounded-full"></div>
          </div>
        ))}
      </div>
      <div className="flex-1 p-5 flex flex-col justify-between bg-black/40">
        <div className="space-y-4">
          <div className="flex gap-2 justify-end">
            <div className="p-3 rounded-2xl bg-white/10 w-32 h-10"></div>
          </div>
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-white/10"></div>
            <div className="p-3 rounded-2xl bg-white/5 w-44 h-14"></div>
          </div>
        </div>
        <div className="h-10 bg-white/5 rounded-xl border border-white/5"></div>
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="flex flex-col gap-3 w-full animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10"></div>
            <div className="flex flex-col gap-1.5">
              <div className="h-3 bg-white/10 rounded-full w-24"></div>
              <div className="h-2 bg-white/5 rounded-full w-16"></div>
            </div>
          </div>
          <div className="w-16 h-7 bg-white/5 rounded-full"></div>
        </div>
      ))}
    </div>
  );

  switch (variant) {
    case 'grid': return renderGridSkeleton();
    case 'video': return renderVideoSkeleton();
    case 'profile': return renderProfileSkeleton();
    case 'messages': return renderMessagesSkeleton();
    case 'list': return renderListSkeleton();
    default: return (
      <div className="space-y-4 w-full">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx}>{renderFeedSkeleton()}</div>
        ))}
      </div>
    );
  }
};

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'pink' | 'cyan' | 'purple' | 'emerald';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: IconComponent = Compass, 
  title, 
  description, 
  actionLabel, 
  onAction,
  variant = 'pink'
}) => {
  const getColors = () => {
    switch (variant) {
      case 'cyan': return { text: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5', gradient: 'from-cyan-400 to-blue-500', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.2)]' };
      case 'purple': return { text: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5', gradient: 'from-purple-500 to-pink-500', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]' };
      case 'emerald': return { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', gradient: 'from-emerald-400 to-teal-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]' };
      default: return { text: 'text-pink-400', border: 'border-pink-500/20', bg: 'bg-pink-500/5', gradient: 'from-pink-500 to-rose-500', glow: 'shadow-[0_0_20px_rgba(236,72,153,0.2)]' };
    }
  };

  const currentColors = getColors();

  return (
    <div className={`glass-panel p-10 rounded-[28px] text-center flex flex-col items-center gap-4 max-w-lg mx-auto w-full border ${currentColors.border} ${currentColors.bg} relative overflow-hidden shadow-2xl`}>
      {/* Decorative Blur Backgrounds */}
      <div className={`absolute top-0 left-12 w-24 h-24 rounded-full blur-[40px] opacity-10 pointer-events-none z-0 ${currentColors.bg}`}></div>
      
      <div className={`p-4 rounded-full border bg-black/60 relative z-10 ${currentColors.border}`}>
        <IconComponent className={`w-10 h-10 ${currentColors.text} animate-pulse`} />
      </div>

      <div className="space-y-1.5 relative z-10">
        <h4 className="text-sm font-display font-extrabold text-white tracking-widest uppercase">{title}</h4>
        <p className="text-[11px] text-gray-500 font-sans max-w-sm leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`relative mt-2 py-2 px-6 rounded-full text-xs font-bold text-white tracking-tight cursor-pointer hover:scale-105 active:scale-95 transition-all z-10 bg-gradient-to-tr ${currentColors.gradient} shadow-lg ${currentColors.glow}`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  onRefresh?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = "Integrity loss in connection stream packets. Unable to resolve payload.", 
  onRetry, 
  onRefresh 
}) => {
  return (
    <div className="glass-panel p-8 rounded-[28px] text-center flex flex-col items-center gap-4 max-w-md mx-auto w-full border border-red-500/15 bg-red-500/5 shadow-2xl relative overflow-hidden">
      {/* Alert visual micro glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[60px] pointer-events-none"></div>

      <div className="p-3.5 rounded-full border border-red-500/20 bg-black/60 text-red-400">
        <AlertTriangle className="w-8 h-8 text-red-500 animate-bounce" />
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-mono font-black text-red-400 uppercase tracking-widest">Payload Interruption</h4>
        <span className="text-[10px] font-bold text-white block uppercase">Unable to load content</span>
        <p className="text-[11px] text-gray-400 leading-relaxed max-w-sm font-sans mt-2">
          {message}
        </p>
      </div>

      <div className="flex gap-3 justify-center w-full mt-3">
        <button
          onClick={onRetry}
          className="flex-1 py-2 px-4 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer shadow-md shadow-red-900/30 font-sans uppercase tracking-wider"
        >
          Retry Load
        </button>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="py-2 px-4 rounded-xl text-xs font-bold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        )}
      </div>
    </div>
  );
};
