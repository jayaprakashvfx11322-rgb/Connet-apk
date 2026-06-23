/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useConnectX } from '../utils/stateManager';
import { YouTubeVideo } from '../types';
import { UnifiedSocialActionBar } from './UnifiedSocialActionBar';
import { PostInsightsModal } from './PostInsightsModal';
import { PostPromotionModal } from './PostPromotionModal';
import { 
  Play, Pause, Volume2, Maximize, RotateCcw, AlertCircle, Heart,
  Share2, Bookmark, FolderHeart, Sparkles, ChevronRight, Send, SlidersHorizontal,
  Youtube, Video
} from 'lucide-react';
import { MOCK_AVATARS, MOCK_IMAGES } from '../utils/mockData';
import { SkeletonLoader, EmptyState, ErrorState } from './StateFeedback';

interface VideosPlayerProps {
  onTriggerCreate?: () => void;
}

export const VideosPlayer: React.FC<VideosPlayerProps> = ({ onTriggerCreate }) => {
  const { 
    videos, currentUser, toggleLikeVideo, addVideoComment, toggleWatchLater, updateVideoStats, setViewedUserId, addAdImpression
  } = useConnectX();

  const [activeCategory, setActiveCategory] = useState<'For You' | 'Trending' | 'Subscribed' | 'Saved'>('For You');
  const [videoState, setVideoState] = useState<'loading' | 'error' | 'success'>('success');
  const [errorMessage, setErrorMessage] = useState('');

  // Custom video player state
  const [playingVideo, setPlayingVideo] = useState<YouTubeVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Track ad impressions when a video starts playing
  useEffect(() => {
    if (playingVideo && playingVideo.publisher?.id) {
      // Simulate random ad views (e.g. 10 to 45 impressions per video play)
      const randomViews = Math.floor(Math.random() * 35) + 10;
      addAdImpression(playingVideo.publisher.id, randomViews);
    }
  }, [playingVideo]);
  const [volume, setVolume] = useState(80);
  const [videoProgress, setVideoProgress] = useState(25); // initial progress percent
  const [streamQuality, setStreamQuality] = useState<'360p' | '480p' | '720p' | '1080p' | '4K'>('1080p');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [newCommentText, setNewCommentText] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);

  // New interactive states for videos see insights and boost
  const [insightsVideo, setInsightsVideo] = useState<YouTubeVideo | null>(null);
  const [promotionVideo, setPromotionVideo] = useState<YouTubeVideo | null>(null);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Synchronize playing streams
  useEffect(() => {
    if (videoElementRef.current) {
      videoElementRef.current.playbackRate = playbackSpeed;
      if (isPlaying) {
        videoElementRef.current.play().catch(e => console.log("Autoplay blocked:", e));
      } else {
        videoElementRef.current.pause();
      }
    }
  }, [isPlaying, playingVideo, playbackSpeed]);

  // Handle category filtered listing
  const filteredVideos = videos.filter(v => {
    if (activeCategory === 'Trending') return v.views > 400000;
    if (activeCategory === 'Saved') return v.watchLater;
    return true; // For You & Subscribed
  });

  const handleVideoSelect = (vid: YouTubeVideo) => {
    setPlayingVideo(vid);
    setIsPlaying(true);
    setVideoProgress(15);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !playingVideo) return;
    addVideoComment(playingVideo.id, newCommentText.trim());
    setNewCommentText('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 pb-20 px-2 font-sans selection:bg-pink-500">
      
      {/* 1. HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div>
          <span className="text-[10px] font-mono tracking-wider font-bold text-gray-400 uppercase">Long-Form Hub</span>
          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <Youtube className="w-6 h-6 text-cyan-400" /> ConnectX TV
          </h2>
        </div>
      </div>

      {/* 2. CHOOSE CATEGORY TABS */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar bg-neutral-950 p-1 rounded-xl border border-white/5">
        <div className="flex gap-1.5">
          {(['For You', 'Trending', 'Subscribed', 'Saved'] as const).map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setVideoState('loading');
                  setActiveCategory(cat);
                  setTimeout(() => setVideoState('success'), 450);
                }}
                className={`py-1 px-4 text-3xs font-bold uppercase rounded-lg tracking-wider transition-all cursor-pointer ${
                  active 
                    ? 'bg-white/10 text-cyan-400 border border-white/10 font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Diagnostic indicator */}
        <div className="flex items-center gap-1.5 py-0.5 px-2 bg-neutral-900 border border-white/5 rounded-full shrink-0 mr-1">
          <span className="text-[8px] font-mono text-gray-500 font-bold uppercase">State:</span>
          <select 
            value={videoState}
            onChange={(e) => {
              const s = e.target.value as any;
              if (s === 'error') setErrorMessage('Payload stream decoding exception (ConnectX TV API).');
              setVideoState(s);
            }}
            className="bg-transparent text-[8px] font-mono text-cyan-400 font-black uppercase outline-none cursor-pointer"
          >
            <option value="success" className="bg-black text-white">Live Succeed</option>
            <option value="loading" className="bg-black text-white">Shimmer Load</option>
            <option value="error" className="bg-black text-white">Error Guard</option>
          </select>
        </div>
      </div>


      {/* 3. CORE VIDEO VIEWPORT OVERLAY (IF SELECTED) */}
      {playingVideo && (
        <div className={`glass-panel rounded-3xl overflow-hidden border border-white/15 shadow-2xl relative ${isMaximized ? 'fixed inset-4 z-50 flex flex-col justify-between' : ''}`}>
          
          {/* Header Row */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent relative z-30">
            <div className="flex gap-2.5 items-center">
              <span className="text-[9px] font-mono py-0.5 px-2.5 bg-cyan-400 text-black font-extrabold rounded-full tracking-widest uppercase">
                Streaming {streamQuality}
              </span>
              <span className="text-gray-400 text-4xs font-mono font-bold">Speed: {playbackSpeed}x</span>
            </div>
            <button 
              onClick={() => {
                setPlayingVideo(null);
                setIsPlaying(false);
              }}
              className="text-4xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 py-1 px-2.5 rounded-full"
            >
              Close Player
            </button>
          </div>

          {/* HTML5 Player Box */}
          <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
            <video
              ref={videoElementRef}
              src={playingVideo.videoUrl}
              className="w-full h-full object-cover"
              controls={false}
              playsInline
              onClick={() => setIsPlaying(!isPlaying)}
            />

            {/* Simulated Video Controller UI bar (Visible on hover) */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 z-20">
              
              {/* Timeline progress line */}
              <div 
                className="w-full h-1 bg-white/20 rounded-full cursor-pointer relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                  setVideoProgress(percent);
                }}
              >
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${videoProgress}%` }}></div>
                <div className="absolute w-2.5 h-2.5 rounded-full bg-white -top-0.5 left-0 transform -translate-x-1/2" style={{ left: `${videoProgress}%` }}></div>
              </div>

              {/* Sub controls row */}
              <div className="flex items-center justify-between text-white text-[11px] font-mono">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <Volume2 className="w-4 h-4 text-gray-300" />
                  <span className="text-4xs text-gray-400">12:35 / {playingVideo.duration}</span>
                </div>
                
                {/* Advanced player controls */}
                <div className="flex items-center gap-2.5 text-[9px] font-bold">
                  {/* Quality selector */}
                  <select 
                    value={streamQuality} 
                    onChange={e => setStreamQuality(e.target.value as any)}
                    className="bg-black/80 border border-white/20 text-white rounded px-1.5 py-0.5 outline-none font-mono"
                  >
                    {['360p', '480p', '720p', '1080p', '4K'].map(q => (
                      <option key={q} value={q} className="bg-neutral-900">{q}</option>
                    ))}
                  </select>

                  {/* Playback speed selection */}
                  <select
                    value={playbackSpeed}
                    onChange={e => setPlaybackSpeed(parseFloat(e.target.value))}
                    className="bg-black/80 border border-white/20 text-white rounded px-1.5 py-0.5 outline-none font-mono"
                  >
                    {[0.5, 1, 1.5, 2].map(speed => (
                      <option key={speed} value={speed} className="bg-neutral-900">{speed}x</option>
                    ))}
                  </select>

                  <button onClick={() => setIsMaximized(!isMaximized)}>
                    <Maximize className="w-3.5 h-3.5 text-gray-300" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Under player video metadata details & comments panel */}
          <div className="p-4 bg-neutral-950/60 border-t border-white/10 text-left">
            <h3 className="text-sm font-bold text-white tracking-tight mb-2 leading-snug">
              {playingVideo.title}
            </h3>

            {/* Views row & save action */}
            <div className="flex items-center justify-between pb-1 mb-2">
              <span className="text-4xs text-gray-400 font-mono">
                {playingVideo.views.toLocaleString()} views • Published {playingVideo.timestamp}
              </span>
            </div>

            <div className="mb-4">
              <UnifiedSocialActionBar
                item={playingVideo}
                contentType="video"
                onOpenInsights={() => setInsightsVideo(playingVideo)}
                onOpenPromotion={() => setPromotionVideo(playingVideo)}
              />
            </div>

            {/* Description expander */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-3xs text-gray-300 mb-4 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto custom-scrollbar">
              <span className="font-bold text-white block mb-1">Description:</span>
              {playingVideo.description}
            </div>

            {/* Mini Comments stream section */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-mono tracking-wider font-bold text-cyan-400 uppercase">Live Comments ({playingVideo.comments.length})</span>
              
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {playingVideo.comments.length === 0 ? (
                  <span className="text-3xs text-gray-500 italic">No comments yet. Write one 👇</span>
                ) : (
                  playingVideo.comments.map(comm => (
                    <div key={comm.id} className="flex gap-2.5 items-start">
                      <img src={comm.user.profilePic} className="w-6 h-6 rounded-full object-cover mt-0.5 shrink-0" alt="Avatar" />
                      <div className="bg-white/5 p-2 rounded-2xl flex-1 border border-white/5">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-4xs font-bold text-white">@{comm.user.username}</span>
                          <span className="text-5xs font-mono text-gray-500">{comm.timestamp}</span>
                        </div>
                        <p className="text-3xs text-gray-300 leading-normal">{comm.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Submit panel */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Share public comments..."
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  className="flex-grow bg-[#101732] border border-white/10 rounded-xl outline-none text-[11px] py-2 px-3 text-white placeholder:text-gray-500"
                />
                <button type="submit" className="p-2 bg-cyan-400 text-black hover:bg-cyan-500 rounded-xl">
                  <Send className="w-3.5 h-3.5 text-black" />
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

      {/* 4. YOUTUBE STYLE VIDEOS GRID LIST */}
      <div className="flex flex-col gap-4">
        {videoState === 'loading' ? (
          <SkeletonLoader variant="video" />
        ) : videoState === 'error' ? (
          <ErrorState 
            message={errorMessage} 
            onRetry={() => {
              setVideoState('loading');
              setTimeout(() => setVideoState('success'), 600);
            }} 
            onRefresh={() => {
              setVideoState('loading');
              setTimeout(() => setVideoState('success'), 500);
            }}
          />
        ) : filteredVideos.length === 0 ? (
          <EmptyState 
            icon={Video} 
            title="No Videos Located" 
            description={
              activeCategory === 'Saved' 
                ? "You haven't bookmarked any widescreen videos to your Watch Later list yet." 
                : `No video feeds were dispatched to category "${activeCategory}" yet.`
            }
            actionLabel={activeCategory === 'Saved' ? "Explore Videos" : "Upload Video content"}
            onAction={() => {
              if (activeCategory === 'Saved') {
                setVideoState('loading');
                setActiveCategory('For You');
                setTimeout(() => setVideoState('success'), 400);
              } else if (onTriggerCreate) {
                onTriggerCreate();
              }
            }}
            variant="purple"
          />
        ) : (
          filteredVideos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => handleVideoSelect(vid)}
              className="group glass-panel rounded-2xl overflow-hidden border-white/10 hover:border-pink-500/20 active:scale-99 transition-all p-3 flex flex-col sm:flex-row gap-4 text-left shadow-lg cursor-pointer animate-fade-in"
            >
              {/* Visual Thumbnail */}
              <div className="relative aspect-video w-full sm:w-48 rounded-xl overflow-hidden border border-white/10 bg-zinc-900 shrink-0">
                <img src={vid.thumbnailUrl} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform" alt="Thumbnail" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                  <div className="p-2.5 rounded-full bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity border border-white/20">
                    <Play className="w-5 h-5 text-white fill-current" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-md text-[9px] font-mono text-white font-bold py-0.5 px-1.5 rounded-md border border-white/10">
                  {vid.duration}
                </span>
              </div>

              {/* Info details */}
              <div className="flex flex-col justify-between py-1">
                <div>
                  {/* Category indicator Tag */}
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#ec4899] block mb-1">
                    {vid.category} • streams {vid.quality}
                  </span>
                  
                  <h3 className="text-xs font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors leading-relaxed line-clamp-2 mb-1.5">
                    {vid.title}
                  </h3>
                </div>

                {/* Creator row */}
                <div className="flex items-center gap-2">
                  <img 
                    onClick={() => setViewedUserId(vid.publisher.id)}
                    src={vid.publisher.profilePic} 
                    className="w-5 relative shrink-0 h-5 rounded-full object-cover border border-white/10 cursor-pointer hover:opacity-85" 
                    alt="Publisher" 
                  />
                  <div>
                    <span 
                      onClick={() => setViewedUserId(vid.publisher.id)}
                      className="text-4xs font-bold text-gray-300 block leading-none cursor-pointer hover:text-yellow-400 transition-colors"
                    >
                      {vid.publisher.displayName}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">
                      {vid.views.toLocaleString()} views • {vid.timestamp}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          ))
        )}
      </div>


      {/* VIDEO INSIGHTS & CAMPAIGN CONFIG OVERLAY PANEL */}
      <PostInsightsModal
        isOpen={insightsVideo !== null}
        onClose={() => setInsightsVideo(null)}
        contentItem={insightsVideo}
        contentType="video"
      />

      <PostPromotionModal
        isOpen={promotionVideo !== null}
        onClose={() => setPromotionVideo(null)}
        contentItem={promotionVideo}
        contentType="video"
        onBoostComplete={(videoId, boostState) => {
          updateVideoStats(videoId, { boosts: boostState });
        }}
      />

    </div>
  );
};
