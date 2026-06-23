/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, MessageCircle, Repeat2, Share2, CornerDownLeft, Download, 
  BarChart2, Rocket, ToggleLeft, ToggleRight, MoreHorizontal, Check, AlertCircle, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useConnectX } from '../utils/stateManager';
import { FeedPost, Reel, YouTubeVideo, Story } from '../types';
import { UnifiedShareModal } from './UnifiedShareModal';

interface UnifiedSocialActionBarProps {
  item: FeedPost | Reel | YouTubeVideo | Story;
  contentType: 'writeup' | 'post' | 'clip' | 'video' | 'story';
  onOpenInsights: () => void;
  onOpenPromotion: () => void;
}

export const UnifiedSocialActionBar: React.FC<UnifiedSocialActionBarProps> = ({
  item,
  contentType,
  onOpenInsights,
  onOpenPromotion,
}) => {
  const { 
    currentUser, 
    updatePostStats, 
    updateReelStats, 
    updateVideoStats, 
    updateStoryStats,
    addComment,
    addReelComment,
    addVideoComment
  } = useConnectX();

  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isReposted, setIsReposted] = useState<boolean>(false);
  const [isShared, setIsShared] = useState<boolean>(false);
  const [isReplied, setIsReplied] = useState<boolean>(false);

  const [showReplyPane, setShowReplyPane] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');
  const [downloadProgress, setDownloadProgress] = useState<number>(-1);
  const [showDownloadTooltip, setShowDownloadTooltip] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // Initialize interactive settings
  useEffect(() => {
    if (!item) return;
    
    // Check if liked
    if (contentType === 'writeup' || contentType === 'post') {
      const p = item as FeedPost;
      setIsLiked(!!currentUser && !!p.reactions && !!p.reactions[currentUser.id]);
    } else if (contentType === 'clip') {
      const r = item as Reel;
      setIsLiked(!!currentUser && !!r.likes && r.likes.includes(currentUser.id));
    } else if (contentType === 'video') {
      const v = item as YouTubeVideo;
      setIsLiked(!!currentUser && !!v.likes && v.likes.includes(currentUser.id));
    } else if (contentType === 'story') {
      const s = item as Story;
      setIsLiked(false); // Stories generally don't persist mutual likes in the mock array but we can toggle
    }
  }, [item, currentUser, contentType]);

  if (!item) return null;

  // Resolve creator identity
  const creatorId = (item as any).user?.id || (item as any).publisher?.id || '';
  const isCreator = currentUser && creatorId && currentUser.id === creatorId;
  const isAdmin = currentUser && (
    currentUser.username.toLowerCase().includes('admin') || 
    currentUser.displayName.toLowerCase().includes('admin') ||
    currentUser.username === 'developer'
  );

  // Check Download configuration (default to true if not specified)
  const downloadsEnabled = item.allowDownloads !== false;

  // Dynamic Metrics Resolution
  const getCounts = () => {
    let likes = 0;
    let comments = 0;
    let shares = 0;
    let reposts = item.repostsCount || 0;
    let replies = item.repliesCount || 0;

    if (contentType === 'writeup' || contentType === 'post') {
      const p = item as FeedPost;
      likes = Object.keys(p.reactions || {}).length;
      comments = p.comments?.length || 0;
      shares = p.shares || 0;
    } else if (contentType === 'clip') {
      const r = item as Reel;
      likes = r.likes?.length || 0;
      comments = r.comments?.length || 0;
      shares = r.shares || 0;
    } else if (contentType === 'video') {
      const v = item as YouTubeVideo;
      likes = v.likes?.length || 0;
      comments = v.comments?.length || 0;
      shares = v.sharesCount || 12; // default if not specified
    } else if (contentType === 'story') {
      const s = item as Story;
      likes = s.likesCount || 0;
      comments = s.commentsCount || 0;
      shares = s.sharesCount || 0;
    }

    return { likes, comments, shares, reposts, replies };
  };

  const counts = getCounts();

  // Unified State Modifier
  const modifyState = (fields: Partial<FeedPost & Reel & YouTubeVideo & Story>) => {
    if (contentType === 'writeup' || contentType === 'post') {
      updatePostStats(item.id, fields);
    } else if (contentType === 'clip') {
      updateReelStats(item.id, fields);
    } else if (contentType === 'video') {
      updateVideoStats(item.id, fields);
    } else if (contentType === 'story') {
      updateStoryStats(item.id, fields);
    }
  };

  // 1. LIKE HANDLER
  const handleLike = () => {
    if (!currentUser) return;
    const newLiked = !isLiked;
    setIsLiked(newLiked);

    if (contentType === 'writeup' || contentType === 'post') {
      const p = item as FeedPost;
      const reactions = { ...(p.reactions || {}) };
      if (newLiked) {
        reactions[currentUser.id] = 'like';
      } else {
        delete reactions[currentUser.id];
      }
      modifyState({ reactions });
    } else if (contentType === 'clip') {
      const r = item as Reel;
      let likes = [...(r.likes || [])];
      if (newLiked) {
        if (!likes.includes(currentUser.id)) likes.push(currentUser.id);
      } else {
        likes = likes.filter(id => id !== currentUser.id);
      }
      modifyState({ likes });
    } else if (contentType === 'video') {
      const v = item as YouTubeVideo;
      let likes = [...(v.likes || [])];
      if (newLiked) {
        if (!likes.includes(currentUser.id)) likes.push(currentUser.id);
      } else {
        likes = likes.filter(id => id !== currentUser.id);
      }
      modifyState({ likes });
    } else if (contentType === 'story') {
      const s = item as Story;
      const likesCount = (s.likesCount || 0) + (newLiked ? 1 : -1);
      modifyState({ likesCount });
    }

    triggerToast(newLiked ? 'Liked post ❤️' : 'Removed Like');
  };

  // 2. REPOST HANDLER
  const handleRepost = () => {
    const newReposted = !isReposted;
    setIsReposted(newReposted);
    const repostsCount = (item.repostsCount || 0) + (newReposted ? 1 : -1);
    modifyState({ repostsCount });
    triggerToast(newReposted ? 'Reposted successfully 🔁' : 'Undo Repost');
  };

  // 3. SHARE HANDLER
  const handleShare = () => {
    setIsShared(true);
    if (typeof window !== 'undefined' && (window as any).triggerGlobalShare) {
      (window as any).triggerGlobalShare(item.id, contentType);
    } else {
      setShowShareModal(true);
    }
  };

  // 4. REPLY / COMMENT HANDLER
  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser) return;

    // Call state manager comment methods
    if (contentType === 'writeup' || contentType === 'post') {
      addComment(item.id, replyText.trim());
    } else if (contentType === 'clip') {
      addReelComment(item.id, replyText.trim());
    } else if (contentType === 'video') {
      addVideoComment(item.id, replyText.trim());
    } else if (contentType === 'story') {
      const s = item as Story;
      const commentsCount = (s.commentsCount || 12) + 1;
      modifyState({ commentsCount });
    }

    // Increment replies counter separately for Live reply tracking
    const repliesCount = (item.repliesCount || 0) + 1;
    modifyState({ repliesCount });

    setReplyText('');
    setShowReplyPane(false);
    triggerToast('Reply published successfully ↩');
  };

  // 5. DOWNLOAD SYSTEM
  const handleDownload = () => {
    if (!downloadsEnabled) {
      return;
    }

    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Generate a real client download of the content
          const textContent = `
=== CONNECTX DIGITAL HARVEST ===
Content ID: ${item.id}
Author: @${(item as any).user?.username || (item as any).publisher?.username || 'creator'}
Type: ${contentType.toUpperCase()}
Timestamp: ${item.timestamp || 'Just Now'}

Content Metadata:
${(item as any).content || (item as any).caption || (item as any).title || 'No text data'}

Stats at download:
Likes: ${counts.likes}
Comments: ${counts.comments}
Shares: ${counts.shares}
Downloaded securely via ConnectX Liquid System.
          `;
          const blob = new Blob([textContent], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `connectx_${contentType}_${item.id}.txt`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Update downloads count state
          const downloadsCount = (item.downloadsCount || 0) + 1;
          modifyState({ downloadsCount });

          setTimeout(() => setDownloadProgress(-1), 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // 6. TOGGLE DOWNLOAD PERMISSION
  const toggleAllowDownloads = () => {
    modifyState({ allowDownloads: !downloadsEnabled });
    triggerToast(!downloadsEnabled ? 'Downloads ENABLED for viewers' : 'Downloads DISABLED for viewers');
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 2500);
  };

  // Render pretty numbers like 12.4K
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Mutual Connection assets
  const mutualLikesPics = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&fit=crop", // Ravi
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&fit=crop", // Karthik
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&fit=crop"  // Priya
  ];

  const mutualSharesPics = [
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&fit=crop", // Priya
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&fit=crop", // Arun
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&fit=crop"  // Vicky
  ];

  const mutualRepostsPics = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&fit=crop", // Arun
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&fit=crop", // Anu
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&fit=crop"  // Priya
  ];

  return (
    <div className="w-full flex flex-col gap-2.5 mt-1.5">
      
      {/* 1. TOAST NOTIFICATION POPUP */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-55 flex items-center gap-1.5 px-3 py-2 bg-black/90 border border-cyan-400/30 text-white rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.25)] text-[9px] font-bold"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. REAL-TIME MUTUAL CONNECTIONS SOCIAL PROOFS - COMPACT */}
      <div className="flex items-center gap-1.5 py-0.5 select-none shrink-0">
        <div className="flex -space-x-1">
          {mutualLikesPics.map((pic, i) => (
            <img 
              key={i} 
              src={pic} 
              alt="Mutual Avatar" 
              className="w-3.5 h-3.5 rounded-full border border-[#0f172a] object-cover shadow-[0_1px_3px_rgba(0,0,0,0.5)]" 
              referrerPolicy="no-referrer"
            />
          ))}
        </div>
        <span className="font-mono text-[8px] font-bold text-gray-400">
          <span className="text-cyan-450 mr-0.5">❤️</span> {formatNumber(counts.likes + 124)}
        </span>
      </div>

      {/* 3. CORE POST ACTION BAR (TWO-ROW LIQUID SYSTEM) */}
      <div className="flex flex-col gap-1.5">
        
        {/* ROW 1: Icons and counts ONLY, NO text labels */}
        <div className="relative p-0.5 bg-white/5 border border-white/10 rounded-md flex items-center justify-around gap-0.5 shadow-inner backdrop-blur-xl">
          
          {/* LIKE ❤️ */}
          <button
            onClick={handleLike}
            className={`relative py-0.5 px-1.5 rounded-md text-[8px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer hover:bg-white/5 active:scale-95 ${
              isLiked 
                ? 'text-pink-500 font-extrabold shadow-[0_0_10px_rgba(236,72,153,0.15)]' 
                : 'text-gray-300'
            }`}
          >
            <Heart className={`w-2.5 h-2.5 ${isLiked ? 'fill-pink-500 stroke-pink-500' : 'text-gray-400'}`} />
            <span className="text-[8px] font-mono font-bold leading-none">{formatNumber(counts.likes)}</span>
          </button>

          {/* COMMENT 💬 */}
          <button
            onClick={() => setShowReplyPane(!showReplyPane)}
            className={`py-0.5 px-1.5 rounded-md text-[8px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer hover:bg-white/5 active:scale-95 ${
              showReplyPane ? 'text-cyan-400 font-extrabold' : 'text-gray-300'
            }`}
          >
            <MessageCircle className="w-2.5 h-2.5 text-gray-400" />
            <span className="text-[8px] font-mono font-bold leading-none">{formatNumber(counts.comments)}</span>
          </button>

          {/* REPOST 🔁 */}
          <button
            onClick={handleRepost}
            className={`py-0.5 px-1.5 rounded-md text-[8px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer hover:bg-white/5 active:scale-95 ${
              isReposted 
                ? 'text-emerald-400 font-extrabold shadow-[0_0_8px_rgba(52,211,153,0.15)]'
                : 'text-gray-300'
            }`}
          >
            <Repeat2 className="w-2.5 h-2.5 text-gray-400" />
            <span className="text-[8px] font-mono font-bold leading-none">{formatNumber(counts.reposts)}</span>
          </button>

          {/* SHARE 📤 */}
          <button
            onClick={handleShare}
            className={`py-0.5 px-1.5 rounded-md text-[8px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer hover:bg-white/5 active:scale-95 ${
              isShared 
                ? 'text-indigo-400 font-extrabold'
                : 'text-gray-300'
            }`}
          >
            <Share2 className="w-2.5 h-2.5 text-gray-400" />
          </button>

          {/* REPLY ↩ */}
          <button
            onClick={() => {
              setShowReplyPane(true);
              setTimeout(() => {
                const el = document.getElementById(`reply-input-${item.id}`);
                if (el) el.focus();
              }, 100);
            }}
            className="py-0.5 px-1.5 rounded-md text-[8px] font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <CornerDownLeft className="w-2.5 h-2.5 text-gray-400" />
            <span className="text-[8px] font-mono font-bold leading-none">{formatNumber(counts.replies)}</span>
          </button>

        </div>

        {/* ROW 2: See Insights, Boost Post, Download */}
        <div className="flex flex-row flex-nowrap items-center justify-between gap-1.5 px-0.5 w-full">
          
          {/* SEE INSIGHTS (VISIBLE FOR OWNER/ADMIN) 📊 */}
          <button
            onClick={onOpenInsights}
            className="flex-1 min-w-0 py-0.5 px-1 rounded-full text-[7.5px] font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:text-cyan-300 transition-all flex items-center justify-center gap-0.5 cursor-pointer active:scale-95 whitespace-nowrap overflow-hidden text-ellipsis"
          >
            <BarChart2 className="w-2 h-2 text-cyan-400 shrink-0" />
            <span className="truncate">See Insights</span>
          </button>

          {/* BOOST POST 🚀 */}
          <button
            onClick={onOpenPromotion}
            className="flex-1 min-w-0 py-0.5 px-1 rounded-full text-[7.5px] font-extrabold text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 hover:text-pink-300 transition-all flex items-center justify-center gap-0.5 cursor-pointer active:scale-95 whitespace-nowrap overflow-hidden text-ellipsis"
          >
            <Rocket className="w-2 h-2 text-pink-400 shrink-0" />
            <span className="truncate">Boost Post</span>
          </button>

          {/* DOWNLOAD SYSTEM ⬇ */}
          <div className="relative flex-1 min-w-0 flex justify-center">
            <button
              onClick={handleDownload}
              disabled={!downloadsEnabled}
              className={`w-full py-0.5 px-1 rounded-full text-[7.5px] font-extrabold transition-all flex items-center justify-center gap-0.5 whitespace-nowrap overflow-hidden text-ellipsis ${
                downloadsEnabled 
                  ? 'text-pink-500 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 font-extrabold cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(236,72,153,0.15)]' 
                  : 'text-gray-500 bg-white/[0.02]/60 border border-white/5 opacity-55 cursor-not-allowed pointer-events-none'
              }`}
            >
              {downloadProgress >= 0 ? (
                <span className="text-[7.5px] font-mono text-pink-400 animate-pulse truncate">
                  {downloadProgress}%
                </span>
              ) : (
                <>
                  <Download className={`w-2 h-2 shrink-0 ${downloadsEnabled ? 'text-pink-400' : 'text-gray-500'}`} />
                  <span className="truncate">Download</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* 5. INLINE RICH QUICK COMMENTS PANE */}
      <AnimatePresence>
        {showReplyPane && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAddReply}
            className="overflow-hidden space-y-1.5 mt-0.5"
          >
            <div className="flex gap-1.5 bg-black/35 p-2 rounded-xl border border-white/5">
              <input
                id={`reply-input-${item.id}`}
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Compose a prompt or response text..."
                className="grow bg-transparent text-[10px] text-white placeholder-gray-500 outline-none px-1.5"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || !currentUser}
                className="py-1 px-3 bg-cyan-500 text-black font-bold rounded-lg text-[8px] disabled:opacity-50 active:scale-95 transition-all cursor-pointer"
              >
                Send Thread
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {!(typeof window !== 'undefined' && (window as any).triggerGlobalShare) && (
        <UnifiedShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          item={item}
          contentType={contentType}
        />
      )}

    </div>
  );
};
