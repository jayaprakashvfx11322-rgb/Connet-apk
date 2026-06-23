/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useConnectX } from '../utils/stateManager';
import { Reel, ReelComment, ConnectXUser } from '../types';
import { UnifiedSocialActionBar } from './UnifiedSocialActionBar';
import { PostInsightsModal } from './PostInsightsModal';
import { PostPromotionModal } from './PostPromotionModal';
import { UnifiedShareModal } from './UnifiedShareModal';
import { 
  Heart, MessageCircle, Share2, Bookmark, Music, Play, Pause, 
  Volume2, VolumeX, Sparkles, Send, X, Users, AlertCircle
} from 'lucide-react';

import { SkeletonLoader, EmptyState, ErrorState } from './StateFeedback';

export interface ReelsViewerProps {
  onTriggerCreate?: () => void;
}

export const ReelsViewer: React.FC<ReelsViewerProps> = ({ onTriggerCreate }) => {
  const { 
    reels, currentUser, toggleLikeReel, addReelComment, toggleSaveReel, users, sendConnectRequest, disconnectUser, updateReelStats, setViewedUserId, addAdImpression
  } = useConnectX();

  const [activeReelIdx, setActiveReelIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [reelsState, setReelsState] = useState<'loading' | 'error' | 'success'>('success');
  const [errorMessage, setErrorMessage] = useState('');

  // Track ad impressions whenever a reel is loaded
  useEffect(() => {
    const activeReel = reels[activeReelIdx];
    if (activeReel && activeReel.user?.id) {
      // Simulate random ad views (e.g. 5 to 25 impressions per reel view) for visual effect,
      // and track securely in the database
      const randomViews = Math.floor(Math.random() * 20) + 5;
      addAdImpression(activeReel.user.id, randomViews);
    }
  }, [activeReelIdx, reels]);

  const [newCommentText, setNewCommentText] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);

  // New interactive states for clips (reels) see insights and boost
  const [insightsReel, setInsightsReel] = useState<Reel | null>(null);
  const [promotionReel, setPromotionReel] = useState<Reel | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Synchronize playing states
  const activeReel = reels[activeReelIdx];

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(err => console.log('Autoplay blocked:', err));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, activeReelIdx]);

  // Handle keypress swiping for supreme desktop/iframe ergonomics
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        handleNextReel();
      } else if (e.key === 'ArrowUp') {
        handlePrevReel();
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [activeReelIdx, reels]);

  const handleNextReel = () => {
    if (activeReelIdx < reels.length - 1) {
      setActiveReelIdx(prev => prev + 1);
      setIsPlaying(true);
    }
  };

  const handlePrevReel = () => {
    if (activeReelIdx > 0) {
      setActiveReelIdx(prev => prev - 1);
      setIsPlaying(true);
    }
  };

  // Comments submit
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeReel) return;
    addReelComment(activeReel.id, newCommentText.trim());
    setNewCommentText('');
  };

  if (reelsState === 'loading') {
    return (
      <div className="h-[80vh] flex items-center justify-center p-6 mx-2 w-full">
        <SkeletonLoader variant="video" />
      </div>
    );
  }

  if (reelsState === 'error') {
    return (
      <div className="h-[80vh] flex items-center justify-center p-6 mx-2 w-full">
        <ErrorState 
          message={errorMessage} 
          onRetry={() => {
            setReelsState('loading');
            setTimeout(() => setReelsState('success'), 600);
          }} 
          onRefresh={() => {
            setReelsState('loading');
            setTimeout(() => setReelsState('success'), 500);
          }}
        />
      </div>
    );
  }

  if (!activeReel || reels.length === 0) {
    return (
      <div className="h-[80vh] flex items-center justify-center p-6 mx-2 w-full">
        <EmptyState 
          icon={Sparkles} 
          title="No Reels Available" 
          description="Upload custom high-res MP4 reel streams via the Creator panel to populate the clips feed."
          actionLabel="Create First Reel"
          onAction={onTriggerCreate}
          variant="pink"
        />
      </div>
    );
  }


  // Get Author details to check Connect states
  const hostUser = users.find(u => u.id === activeReel.user.id);
  const isConnected = currentUser && hostUser && currentUser.connects.includes(hostUser.id);
  const hasPending = currentUser && hostUser && currentUser.sentRequests.includes(hostUser.id);

  return (
    <div className="w-full max-w-md mx-auto h-[82vh] bg-black rounded-3xl border border-white/10 relative overflow-hidden flex shadow-2xl">
      
      {/* 1. PRIMARY VIDEO LAYER */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950">
        <video
          ref={videoRef}
          src={activeReel.videoUrl}
          className="w-full h-full object-cover rounded-3xl"
          loop
          autoPlay
          playsInline
          muted={muted}
          onClick={() => setIsPlaying(!isPlaying)}
        />
        
        {/* Play/Pause Overlay indicator badge */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-20 animate-fade-in">
            <div className="p-4 rounded-full bg-white/10 backdrop-blur-md">
              <Play className="w-10 h-10 text-white fill-current animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* 2. GRADIENT TOP & BOTTOM LENS REFLECTION COVERS */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/75 to-transparent z-20 pointer-events-none"></div>
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-20 pointer-events-none"></div>

      {/* 3. FLOATING TOP CONTROLS (Swipe Indicators & Volume) */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-30">
        <div className="flex bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
          <button 
            disabled={activeReelIdx === 0}
            onClick={handlePrevReel}
            className="py-1 px-2.5 text-[10px] font-bold uppercase hover:bg-white/10 text-gray-200 disabled:opacity-30 rounded-full cursor-pointer"
          >
            Prev
          </button>
          <span className="text-[10px] text-gray-500 font-bold self-center px-1 font-mono">
            {activeReelIdx + 1}/{reels.length}
          </span>
          <button 
            disabled={activeReelIdx === reels.length - 1}
            onClick={handleNextReel}
            className="py-1 px-2.5 text-[10px] font-bold uppercase hover:bg-white/10 text-gray-200 disabled:opacity-30 rounded-full cursor-pointer"
          >
            Next
          </button>
        </div>

        {/* State select switcher */}
        <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md py-0.5 px-2 rounded-full border border-white/10 scale-90">
          <span className="text-[8px] font-mono text-gray-400 font-bold uppercase">State:</span>
          <select 
            value={reelsState}
            onChange={(e) => {
              const s = e.target.value as any;
              if (s === 'error') setErrorMessage('Payload stream decoding exception (Reels API).');
              setReelsState(s);
            }}
            className="bg-transparent text-[8px] font-mono text-pink-400 font-black uppercase outline-none cursor-pointer"
          >
            <option value="success" className="bg-black text-white">Live Success</option>
            <option value="loading" className="bg-black text-white">Shimmer Load</option>
            <option value="error" className="bg-black text-white">Error Guard</option>
          </select>
        </div>

        <div className="flex gap-1.5">
          {/* Analytics toggle */}
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-pink-400 hover:text-pink-300 transition-colors cursor-pointer"

            title="Real-time Analytics"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setMuted(!muted)}
            className="p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-pink-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* 4. SIDE ACTIONS BAR PANEL (Heart, Comments, Shares, Saves) */}
      <div className="absolute right-3.5 bottom-28 flex flex-col items-center gap-4 z-30">
        
        {/* Host Avatar & Connect shortcut */}
        <div className="relative mb-2">
          <div 
            onClick={() => setViewedUserId(activeReel.user.id)}
            className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-tr from-cyan-400 to-pink-500 shadow-md cursor-pointer hover:opacity-85"
          >
            <img src={activeReel.user.profilePic} className="w-full h-full rounded-full object-cover border border-black" alt="Author" />
          </div>
          {currentUser && activeReel.user.id !== currentUser.id && (
            <button
              onClick={() => {
                if (isConnected) {
                  disconnectUser(activeReel.user.id);
                } else if (!hasPending) {
                  sendConnectRequest(activeReel.user.id);
                }
              }}
              className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 py-0.5 px-1.5 rounded-full text-[8px] font-extrabold uppercase select-none border transition-all cursor-pointer ${
                isConnected 
                  ? 'bg-neutral-800 border-neutral-700 text-gray-400'
                  : hasPending
                    ? 'bg-yellow-500/25 border-yellow-500/40 text-yellow-300'
                    : 'bg-pink-500 border-transparent text-white shadow-lg animate-pulse'
              }`}
            >
              {isConnected ? '✓' : hasPending ? 'Wait' : 'Link'}
            </button>
          )}
        </div>

        {/* Reaction */}
        <div className="flex flex-col items-center gap-1 group">
          <button
            onClick={() => toggleLikeReel(activeReel.id)}
            className={`p-3 rounded-full bg-black/40 backdrop-blur-lg border border-white/10 group-hover:scale-110 active:scale-90 transition-all text-white cursor-pointer ${
              currentUser && activeReel.likes.includes(currentUser.id) ? 'text-pink-500 border-pink-500/35 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : ''
            }`}
          >
            <Heart className="w-4.5 h-4.5 fill-current" />
          </button>
          <span className="text-[10px] font-mono font-bold text-gray-300">
            {activeReel.likes.length > 0 ? activeReel.likes.length : '12.4K'}
          </span>
        </div>

        {/* Comments */}
        <div className="flex flex-col items-center gap-1 group">
          <button
            onClick={() => setShowComments(true)}
            className="p-3 rounded-full bg-black/40 backdrop-blur-lg border border-white/10 group-hover:scale-110 active:scale-90 transition-all text-white cursor-pointer"
          >
            <MessageCircle className="w-4.5 h-4.5" />
          </button>
          <span className="text-[10px] font-mono font-bold text-gray-300">
            {activeReel.comments.length > 0 ? activeReel.comments.length : '256'}
          </span>
        </div>

        {/* Shares */}
        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={() => setShowShareModal(true)}
            className="p-3 rounded-full bg-black/40 backdrop-blur-lg border border-white/10 hover:scale-110 transition-all text-white cursor-pointer"
          >
            <Share2 className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Save */}
        <button
          onClick={() => toggleSaveReel(activeReel.id)}
          className={`p-3 rounded-full bg-black/40 backdrop-blur-lg border border-white/10 hover:scale-110 transition-all text-white cursor-pointer ${
            currentUser && activeReel.saves.includes(currentUser.id) ? 'text-cyan-400 border-cyan-400/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''
          }`}
        >
          <Bookmark className="w-4.5 h-4.5" />
        </button>

      </div>

      {/* 5. BOTTOM INFO MARQUEE OVERLAY */}
      <div className="absolute left-4 right-20 bottom-5 z-30 flex flex-col gap-1.5 select-none">
        
        {/* User Name & Connect Check */}
        <div className="flex items-center gap-1.5">
          <span 
            onClick={() => setViewedUserId(activeReel.user.id)}
            className="font-bold text-xs tracking-tight text-white hover:text-yellow-400 cursor-pointer transition-colors"
          >
            {activeReel.user.displayName}
          </span>
          <span 
            onClick={() => setViewedUserId(activeReel.user.id)}
            className="text-[7px] font-mono text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors"
          >
            @{activeReel.user.username}
          </span>
        </div>

        {/* Caption */}
        <p className="text-[9.5px] leading-normal text-gray-200 line-clamp-2">
          {activeReel.caption}{' '}
          {activeReel.hashtags.map(h => (
            <span key={h} className="text-cyan-400 font-semibold mr-1">#{h}</span>
          ))}
        </p>

        {/* Scrolling audio marquee */}
        <div className="flex items-center gap-2 mt-0.5 w-full bg-black/20 py-0.5 px-2 rounded-full border border-white/5 max-w-sm overflow-hidden">
          <Music className="w-3 h-3 text-pink-400 shrink-0" />
          <div className="text-4xs text-gray-300 font-mono font-medium whitespace-nowrap overflow-hidden relative grow">
            <span className="inline-block animate-marquee pl-[100%]">
              {activeReel.soundTitle} — Apple Liquid Sound Engine (Lossless)
            </span>
          </div>
        </div>

        {/* Real-time liquid social action bar on clips */}
        <div className="mt-1 w-full max-w-md">
          <UnifiedSocialActionBar
            item={activeReel}
            contentType="clip"
            onOpenInsights={() => setInsightsReel(activeReel)}
            onOpenPromotion={() => setPromotionReel(activeReel)}
          />
        </div>

      </div>

      {/* 6. CREATOR ANALYTICS OVERLAY TRAY */}
      {showAnalytics && (
        <div className="absolute inset-x-4 top-16 bg-blue-950/90 border border-cyan-500/20 backdrop-blur-xl rounded-2xl p-4 z-40 animate-slide-in">
          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">Reels Real-Time Auto-Analytics</span>
            <button onClick={() => setShowAnalytics(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-white">
            <div className="bg-black/40 p-2 rounded-xl">
              <span className="text-[9px] text-gray-400 block font-mono">VIEWS</span>
              <span className="text-xs font-bold font-mono">{activeReel.views + 1201}</span>
            </div>
            <div className="bg-black/40 p-2 rounded-xl">
              <span className="text-[9px] text-gray-400 block font-mono">AVG RETAIN</span>
              <span className="text-xs font-bold font-mono text-green-400">92.4%</span>
            </div>
            <div className="bg-black/40 p-2 rounded-xl">
              <span className="text-[9px] text-gray-400 block font-mono">EST EARN</span>
              <span className="text-xs font-bold font-mono text-yellow-400">${((activeReel.views + 1201) * 0.002).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 7. REELS DRAWER COMMENTS TRAY OVERLAY */}
      {showComments && (
        <div className="absolute inset-x-0 bottom-0 max-h-[55%] bg-[#080d22]/98 border-t border-white/20 rounded-t-3xl z-40 flex flex-col animate-slide-up select-none">
          
          <div className="w-10 h-1 bg-white/15 rounded-full mx-auto my-3 cursor-pointer" onClick={() => setShowComments(false)}></div>

          <div className="flex items-center justify-between px-5 pb-2 border-b border-white/5">
            <span className="text-xs font-bold text-white">Reel Conversations ({activeReel.comments.length})</span>
            <button onClick={() => setShowComments(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3 gap-3 flex flex-col custom-scrollbar">
            {activeReel.comments.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-xs flex flex-col items-center gap-1.5">
                <AlertCircle className="w-6 h-6 text-gray-600" />
                <span>No comments yet. Write one to align!</span>
              </div>
            ) : (
              activeReel.comments.map((comm) => {
                const commenterUser = users.find(u => u.username === comm.username);
                return (
                  <div key={comm.id} className="flex gap-2.5 text-left">
                    <img 
                      onClick={() => { if (commenterUser) setViewedUserId(commenterUser.id); }}
                      src={comm.profilePic} 
                      className={`w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 ${commenterUser ? 'cursor-pointer hover:opacity-85' : ''}`} 
                      alt="Commenter" 
                    />
                    <div className="flex-grow bg-white/5 py-1.5 px-3 rounded-2xl">
                      <div className="flex justify-between items-center mb-0.5">
                        <span 
                          onClick={() => { if (commenterUser) setViewedUserId(commenterUser.id); }}
                          className={`text-[10px] font-bold text-white leading-none ${commenterUser ? 'cursor-pointer hover:text-yellow-400 transition-colors' : ''}`}
                        >
                          @{comm.username}
                        </span>
                      <span className="text-[8px] font-mono text-gray-500">{comm.timestamp}</span>
                    </div>
                    <p className="text-[10px] text-gray-300 leading-normal">{comm.text}</p>
                  </div>
                </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="p-3 bg-neutral-900 flex gap-2 border-t border-white/5 pb-6">
            <input
              type="text"
              placeholder="Add loop comment securely..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="flex-1 bg-[#121c3d] border border-white/10 rounded-xl outline-none text-xs py-2.5 px-3 text-white placeholder:text-gray-500"
            />
            <button type="submit" className="p-2.5 bg-pink-500 rounded-xl text-white text-xs">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

      {/* CLIPS OVERLAY INSIGHTS & PROMOTION ANALYTICS */}
      <PostInsightsModal
        isOpen={insightsReel !== null}
        onClose={() => setInsightsReel(null)}
        contentItem={insightsReel}
        contentType="clip"
      />

      <PostPromotionModal
        isOpen={promotionReel !== null}
        onClose={() => setPromotionReel(null)}
        contentItem={promotionReel}
        contentType="clip"
        onBoostComplete={(reelId, boostState) => {
          updateReelStats(reelId, { boosts: boostState });
        }}
      />

      {!(typeof window !== 'undefined' && (window as any).triggerGlobalShare) && (
        <UnifiedShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          item={activeReel}
          contentType="clip"
        />
      )}

    </div>
  );
};
