/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useConnectX } from '../utils/stateManager';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { FeedPost, Story, StoryViewer, MiniUser, ConnectXUser } from '../types';
import { UnifiedSocialActionBar } from './UnifiedSocialActionBar';
import { PostInsightsModal } from './PostInsightsModal';
import { PostPromotionModal } from './PostPromotionModal';
import { SkeletonLoader, EmptyState, ErrorState } from './StateFeedback';
import { StoryAvatar } from './StoryAvatar';
import { 
  Heart, MessageCircle, Share2, Search, Bell, Plus, Vote, 
  Send, Smile, ThumbsUp, Laugh, AlertCircle, X, ChevronRight,
  Eye, CornerDownRight, ExternalLink, Check, SlidersHorizontal, ShieldCheck,
  Link2, RefreshCw, Layers, Fingerprint, Network, QrCode, Sparkles, Zap
} from 'lucide-react';
import { MOCK_AVATARS, MOCK_IMAGES } from '../utils/mockData';

const TRENDING_TOPICS = [
  { tag: '#ConnectXVibe', count: '142.5k vibes', type: 'Vibe Match', isHot: true },
  { tag: '#LiquidGlass', count: '98.3k posts', type: 'UI Artistry', isHot: true },
  { tag: '#CreatorCoin', count: '64.1k hubs', type: 'Token Economy', isHot: false },
  { tag: '#Web3Atmosphere', count: '45.8k streams', type: 'Ambient Node', isHot: false },
  { tag: '#NextGenVlogs', count: '32.4k vlogs', type: 'Pro Output', isHot: false }
];

interface HomeFeedProps {
  onOpenCreateMenu: () => void;
  onSelectUserTab: (tab: string) => void;
  onSearchQuery: (query: string) => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({ onOpenCreateMenu, onSelectUserTab, onSearchQuery }) => {
  const { 
    currentUser, posts, stories, users, toggleReaction, voteInPoll, addComment, selectChatUser, updatePostStats, setViewedUserId
  } = useConnectX();

  const [search, setSearch] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showDesktopDropdown, setShowDesktopDropdown] = useState(false);
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('connectx_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const addRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem('connectx_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRecentSearchClick = (query: string) => {
    setSearch(query);
    onSearchQuery(query);
    addRecentSearch(query);
    setShowDesktopDropdown(false);
    setShowMobileDropdown(false);
  };

  const removeRecentSearch = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(q => q !== query);
      localStorage.setItem('connectx_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('connectx_recent_searches');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node)) {
        setShowDesktopDropdown(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setShowMobileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [filter, setFilter] = useState<'All' | 'Posts' | 'Images' | 'Reels' | 'Videos'>('All');
  const [feedState, setFeedState] = useState<'loading' | 'error' | 'success'>('success');
  const [errorMessage, setErrorMessage] = useState('');

  // Expose window hook for Behance showcase
  useEffect(() => {
    (window as any).overrideHomeFeedFilter = (newFilter: 'All' | 'Posts' | 'Images' | 'Reels' | 'Videos') => {
      setFilter(newFilter);
    };
    return () => {
      delete (window as any).overrideHomeFeedFilter;
    };
  }, []);

  
  // Interactive insights & promotion dashboard states
  const [insightsPost, setInsightsPost] = useState<FeedPost | null>(null);
  const [insightsType, setInsightsType] = useState<'writeup' | 'post'>('post');
  const [promotionPost, setPromotionPost] = useState<FeedPost | null>(null);
  const [promotionType, setPromotionType] = useState<'writeup' | 'post'>('post');

  const triggerHaptic = useHapticFeedback();

  // Quick Share configurations and temporary selections
  const [activeSharePost, setActiveSharePost] = useState<FeedPost | null>(null);
  const [sharePreviewPost, setSharePreviewPost] = useState<FeedPost | null>(null);
  const [shareClipboardCopied, setShareClipboardCopied] = useState(false);
  const [shareConfig, setShareConfig] = useState({
    includeSignature: true,
    hifiGlassRefraction: true,
    includeTelemetry: false,
    shortenLink: false
  });
  
  // Toast notifications for liquid share actions
  const [activeToast, setActiveToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Pull-to-refresh mechanism states & parameters
  const [pullY, setPullY] = useState<number>(0);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const startTouchY = useRef<number>(0);
  const isAtTopRef = useRef<boolean>(true);

  // Touch handlers for the pull-to-refresh gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    
    // Check if the primary viewport containment is at the top
    const scrollContainer = document.querySelector('main') || document.documentElement;
    const isAtTop = scrollContainer.scrollTop <= 2;
    isAtTopRef.current = isAtTop;
    
    if (isAtTop) {
      startTouchY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isRefreshing || !isPulling || !isAtTopRef.current) return;
    
    const currentY = e.touches[0].clientY;
    const diffY = currentY - startTouchY.current;
    
    if (diffY > 1) {
      // Pull down gesture
      const resistance = 0.45;
      const dragY = Math.min(diffY * resistance, 95); // Cap at 95px displacement
      setPullY(dragY);
      
      // Prevent browser default scroll behaviors when dragging past 5px limit
      if (dragY > 5 && e.cancelable) {
        e.preventDefault();
      }
    } else {
      setPullY(0);
    }
  };

  const handleTouchEnd = () => {
    if (isRefreshing || !isPulling) return;
    setIsPulling(false);
    
    if (pullY >= 65) {
      triggerLiquidRefresh();
    } else {
      setPullY(0);
    }
  };

  const triggerLiquidRefresh = () => {
    setIsRefreshing(true);
    setPullY(65); // Lock pull visual position during refreshing stage
    triggerHaptic('medium');
    setFeedState('loading');
    
    setTimeout(() => {
      setFeedState('success');
      setIsRefreshing(false);
      setPullY(0);
      triggerHaptic('success');
      showToast("Feed successfully synced & decrypted! 📡", "success");
    }, 1300);
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setActiveToast({ message, type });
    setTimeout(() => {
      setActiveToast((current) => current && current.message === message ? null : current);
    }, 4000);
  };

  const generateDynamicLink = (post: FeedPost) => {
    const baseUrl = `https://connectx.app/share/posts/${post.id}`;
    const params: string[] = [];
    
    if (currentUser) {
      params.push(`ref=${currentUser.username}`);
    }
    if (shareConfig.includeSignature) {
      params.push(`sign=liquid_signature_${post.user.username}`);
    }
    if (shareConfig.hifiGlassRefraction) {
      params.push(`layer=visionos_high_index`);
    }
    if (shareConfig.includeTelemetry) {
      params.push(`telemetry=iphone17_pro_specular_v2`);
    }
    if (shareConfig.shortenLink) {
      params.push(`short=1`);
    }
    
    const queryStr = params.length > 0 ? `?${params.join('&')}` : '';
    return `${baseUrl}${queryStr}`;
  };

  const handleQuickShare = (post: FeedPost) => {
    triggerHaptic('medium');
    setSharePreviewPost(post);
  };

  const executeSharingDialog = (post: FeedPost) => {
    triggerHaptic('medium');
    setSharePreviewPost(null);
    const targetLink = generateDynamicLink(post);
    
    if (navigator.share) {
      navigator.share({
        title: `ConnectX Post by @${post.user.username}`,
        text: post.content ? (post.content.length > 120 ? `${post.content.substring(0, 117)}...` : post.content) : 'Check out this post on ConnectX!',
        url: targetLink,
      })
      .then(() => {
        triggerHaptic('success');
        updatePostStats(post.id, { shares: (post.shares || 0) + 1 });
        showToast("Shared successfully with Dynamic Link!");
      })
      .catch((error) => {
        // If aborted or failed (e.g. in sandbox/iframe environments), fallback to custom Liquid Link Hub
        console.log('Native share dismissed or failed, fallback to Liquid Link Hub:', error);
        setActiveSharePost(post);
        setShareClipboardCopied(false);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(targetLink)
            .then(() => {
              setShareClipboardCopied(true);
              triggerHaptic('success');
              updatePostStats(post.id, { shares: (post.shares || 0) + 1 });
              showToast("Link in clipboard! Specular route customizing.");
              setTimeout(() => setShareClipboardCopied(false), 3000);
            })
            .catch(() => {
              setShareClipboardCopied(false);
              showToast("Specular parameter route loaded.", "info");
            });
        }
      });
    } else {
      // Fallback for browsers/iframes without navigator.share
      setActiveSharePost(post);
      setShareClipboardCopied(false);
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(targetLink)
          .then(() => {
            setShareClipboardCopied(true);
            triggerHaptic('success');
            updatePostStats(post.id, { shares: (post.shares || 0) + 1 });
            showToast("Copied to clipboard! Customizing spatial layers.");
            setTimeout(() => setShareClipboardCopied(false), 3000);
          })
          .catch(() => {
            setShareClipboardCopied(false);
            showToast("Spatial layers initialized.", "info");
          });
      }
    }
  };

  const handleToggleOption = (key: keyof typeof shareConfig) => {
    triggerHaptic('light');
    const updatedConfig = { ...shareConfig, [key]: !shareConfig[key] };
    setShareConfig(updatedConfig);
    setShareClipboardCopied(false);
    
    if (activeSharePost) {
      const targetLink = generateDynamicLink(activeSharePost);
      if (navigator.clipboard) {
         navigator.clipboard.writeText(targetLink)
          .then(() => {
            setShareClipboardCopied(true);
            triggerHaptic('success');
            setTimeout(() => setShareClipboardCopied(false), 3000);
          });
      }
    }
  };
  
  // Reaction picker state
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);
  
  // Comment modal state
  const [commentingPost, setCommentingPost] = useState<FeedPost | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // Group active stories by user, uniquely
  const uniqueUsersWithStories = React.useMemo(() => {
    const userMap: { [userId: string]: { user: any; hasUnviewed: boolean; latestStoryCreatedAt: number } } = {};
    
    stories.forEach(story => {
      const uId = story.user.id;
      const hasUnviewed = !story.viewers.some(v => v.userId === currentUser?.id);
      
      if (!userMap[uId]) {
        userMap[uId] = {
          user: story.user,
          hasUnviewed: hasUnviewed,
          latestStoryCreatedAt: story.createdAt || 0
        };
      } else {
        if (hasUnviewed) {
          userMap[uId].hasUnviewed = true;
        }
        if ((story.createdAt || 0) > userMap[uId].latestStoryCreatedAt) {
          userMap[uId].latestStoryCreatedAt = story.createdAt || 0;
        }
      }
    });

    return Object.values(userMap).sort((a, b) => {
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return b.latestStoryCreatedAt - a.latestStoryCreatedAt;
    });
  }, [stories, currentUser?.id]);

  // Handle Search Input dispatch
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchQuery(search);
    addRecentSearch(search);
    setShowDesktopDropdown(false);
    setShowMobileDropdown(false);
  };

  // Submit Comments
  const handlePostCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentingPost || !newCommentText.trim()) return;
    addComment(commentingPost.id, newCommentText.trim());
    setNewCommentText('');
    // refresh commenting post in UI to show comment
    const updatedPost = posts.find(p => p.id === commentingPost.id);
    if (updatedPost) setCommentingPost(updatedPost);
  };

  const getReactionEmoji = (type?: string) => {
    switch (type) {
      case 'love': return '💖';
      case 'laugh': return '😂';
      case 'wow': return '😮';
      case 'sad': return '😢';
      default: return '👍';
    }
  };

  // Filter posts list
  const filteredPosts = posts.filter(post => {
    if (filter === 'Posts') return post.mediaType === 'text' || post.mediaType === 'poll';
    if (filter === 'Images') return post.mediaType === 'image';
    if (filter === 'Reels') return post.mediaType === 'video' && post.content.includes('#reel'); // simulated
    if (filter === 'Videos') return post.mediaType === 'video' && !post.content.includes('#reel');
    return true; // All
  });

  const handleFilterChange = (tab: typeof filter) => {
    setFeedState('loading');
    setFilter(tab);
    setTimeout(() => {
      setFeedState('success');
    }, 450);
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full max-w-2xl mx-auto flex flex-col gap-4 selection:bg-pink-500 pb-16 px-2 font-sans"
    >
      
      {/* LIQUID-GLASS PULL TO REFRESH SPINNER */}
      <motion.div
        style={{ height: pullY, opacity: pullY > 5 ? 1 : 0 }}
        animate={{ 
          height: isPulling ? pullY : isRefreshing ? 75 : 0,
          opacity: isPulling ? Math.min(pullY / 45, 1) : isRefreshing ? 1 : 0 
        }}
        transition={isPulling ? { type: 'just' } : { type: 'spring', damping: 22, stiffness: 200 }}
        className="w-full overflow-hidden flex items-center justify-center relative shrink-0 z-40"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Glowing cyan gradient pulse backdrop */}
          <div 
            className={`absolute w-36 h-12 bg-gradient-to-r from-cyan-400/20 via-sky-500/10 to-teal-400/20 rounded-full blur-2xl transition-all duration-700 ${
              isRefreshing ? 'animate-pulse scale-125 opacity-100' : 'scale-100 opacity-70'
            }`}
          />
          <div className="absolute w-12 h-12 bg-cyan-500/10 rounded-full blur-lg animate-ping" />
        </div>

        {/* Liquid Glass Capsule structure */}
        <div 
          className="relative flex items-center gap-3 p-2 px-4 bg-gradient-to-r from-[#0a1128]/70 to-[#0e1b3d]/70 backdrop-blur-xl rounded-full border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15),inset_0_1px_1px_rgba(255,255,255,0.2)] select-none transition-all duration-300"
          style={{
            transform: `scale(${Math.min(0.6 + (pullY / 140), 1)})`,
          }}
        >
          {/* Top highlight refraction line */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
          
          {/* Custom Liquid Glass Spinner Circle */}
          <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
            {/* Spinning/pulsing neon tracker rings */}
            <div className={`absolute inset-0 rounded-full border-2 border-cyan-500/20 ${isRefreshing ? 'animate-ping opacity-75' : ''}`} />
            
            <div 
              className={`w-full h-full rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400/45 transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
              style={{ 
                transform: isRefreshing ? undefined : `rotate(${pullY * 5.5}deg)` 
              }}
            >
              {/* Core specular highlight drop */}
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_8px_rgba(34,211,238,1)]" />
            </div>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[9.5px] font-mono font-black text-white tracking-widest leading-none">
              {isRefreshing 
                ? "SYNCING PEER DIODES" 
                : pullY >= 65 
                  ? "RELEASE TO TRANSFER" 
                  : "PULL TO DECRYPT FEED"
              }
            </span>
            <span className="text-[7.5px] font-mono font-bold text-cyan-400/85 tracking-wider mt-0.5 leading-none uppercase">
              {isRefreshing ? "RE-ESTABLISHING CRYPTO LINK" : `Displacement: ${Math.round(pullY)}px`}
            </span>
          </div>

          {/* Glowing Status Indicator Orb */}
          <div className="relative flex h-2 w-2 shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRefreshing ? 'bg-pink-400' : 'bg-cyan-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isRefreshing ? 'bg-pink-500' : 'bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,1)]'}`}></span>
          </div>
        </div>
      </motion.div>

      {/* 1. TOP HEADER SECTION */}
      <div className="flex items-center justify-between gap-3 py-1.5 border-b border-white/5">
        <h1 className="text-2xl font-display font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 bg-clip-text text-transparent">
          ConnectX
        </h1>
        
        {/* Search bar form */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xs hidden sm:block">
          <div ref={desktopSearchRef} className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              placeholder="Search people, hashtags, vlogs..."
              value={search}
              onFocus={() => setShowDesktopDropdown(true)}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-900/60 border border-white/10 rounded-full text-[11px] outline-none focus:border-cyan-400 focus:bg-neutral-900 transition-all text-white font-medium"
            />
            {showDesktopDropdown && (recentSearches.length > 0 || TRENDING_TOPICS.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-2 text-left overflow-hidden flex flex-col gap-2 min-w-[220px]">
                {recentSearches.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between px-1.5 py-0.5 border-b border-white/5">
                      <span className="text-[7.5px] font-mono font-bold text-gray-400 uppercase tracking-wider">Recent Searches</span>
                      <button 
                        type="button"
                        onClick={clearAllRecentSearches}
                        className="text-[7.5px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-col gap-0.5 max-h-[110px] overflow-y-auto no-scrollbar">
                      {recentSearches.map((query, index) => (
                        <div
                          key={index}
                          onClick={() => handleRecentSearchClick(query)}
                          className="group/item flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded-lg cursor-pointer transition-colors animate-in fade-in slide-in-from-top-1 duration-100"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-gray-500 group-hover/item:text-cyan-400 transition-colors text-[10px]">🕒</span>
                            <span className="text-[10px] text-gray-300 group-hover/item:text-white transition-colors truncate font-medium">{query}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => removeRecentSearch(e, query)}
                            className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Topics Area */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between px-1.5 py-0.5 border-b border-white/5">
                    <span className="text-[7.5px] font-mono font-bold text-gray-450 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-2 h-2 text-purple-400 animate-pulse" />
                      Trending topics
                    </span>
                    <span className="text-[6.5px] font-mono text-gray-500 uppercase tracking-widest bg-white/5 px-1 rounded-sm">Vibe Hub</span>
                  </div>
                  <div className="flex flex-col gap-0.5 max-h-[180px] overflow-y-auto no-scrollbar">
                    {TRENDING_TOPICS.map((topic, index) => (
                      <div
                        key={index}
                        onClick={() => handleRecentSearchClick(topic.tag)}
                        className="group/trend flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded-lg cursor-pointer transition-all duration-150 relative overflow-hidden"
                      >
                        {topic.isHot && (
                          <div className="absolute inset-0 bg-cyan-500/[0.02] group-hover/trend:bg-cyan-500/[0.05] transition-all"></div>
                        )}
                        <div className="flex items-center gap-2 relative z-10 truncate">
                          {topic.isHot ? (
                            <Zap className="w-2.5 h-2.5 text-cyan-400 animate-pulse shrink-0" />
                          ) : (
                            <span className="text-gray-600 group-hover/trend:text-cyan-400 transition-colors text-[9px] shrink-0 font-bold">#</span>
                          )}
                          <div className="flex flex-col truncate">
                            <span className="text-[10px] font-black tracking-tight text-white group-hover/trend:text-cyan-400 transition-colors truncate">
                              {topic.tag}
                            </span>
                            <span className="text-[7.5px] text-gray-450 leading-none">
                              {topic.type}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end relative z-10 shrink-0">
                          <span className="text-[8px] font-mono font-semibold text-gray-400 group-hover/trend:text-white transition-colors">
                            {topic.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="flex items-center gap-1.5">
          {/* Notifications link shortcut */}
          <button 
            onClick={() => onSelectUserTab('Notifications')}
            className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all relative cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-gray-200" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-pink-500 rounded-full ring-1 ring-black animate-ping"></span>
          </button>
        </div>
      </div>

      {/* Mobile Search - Visible only below sm */}
      <form onSubmit={handleSearchSubmit} className="sm:hidden block">
        <div ref={mobileSearchRef} className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Search communities, trends..."
            value={search}
            onFocus={() => setShowMobileDropdown(true)}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-white/10 rounded-full text-[11px] outline-none focus:border-cyan-400 transition-all text-white"
          />
          {showMobileDropdown && (recentSearches.length > 0 || TRENDING_TOPICS.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-2 text-left overflow-hidden flex flex-col gap-2 min-w-[220px]">
              {recentSearches.length > 0 && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between px-1.5 py-0.5 border-b border-white/5">
                    <span className="text-[7.5px] font-mono font-bold text-gray-400 uppercase tracking-wider">Recent Searches</span>
                    <button 
                      type="button"
                      onClick={clearAllRecentSearches}
                      className="text-[7.5px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-col gap-0.5 max-h-[110px] overflow-y-auto no-scrollbar">
                    {recentSearches.map((query, index) => (
                      <div
                        key={index}
                        onClick={() => handleRecentSearchClick(query)}
                        className="group/item flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded-lg cursor-pointer transition-colors animate-in fade-in slide-in-from-top-1 duration-100"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-gray-500 group-hover/item:text-cyan-400 transition-colors text-[10px]">🕒</span>
                          <span className="text-[10px] text-gray-300 group-hover/item:text-white transition-colors truncate font-medium">{query}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(e, query)}
                          className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Topics Area */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between px-1.5 py-0.5 border-b border-white/5">
                  <span className="text-[7.5px] font-mono font-bold text-gray-450 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-2 h-2 text-purple-400 animate-pulse" />
                    Trending topics
                  </span>
                  <span className="text-[6.5px] font-mono text-gray-500 uppercase tracking-widest bg-white/5 px-1 rounded-sm">Vibe Hub</span>
                </div>
                <div className="flex flex-col gap-0.5 max-h-[180px] overflow-y-auto no-scrollbar">
                  {TRENDING_TOPICS.map((topic, index) => (
                    <div
                      key={index}
                      onClick={() => handleRecentSearchClick(topic.tag)}
                      className="group/trend flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded-lg cursor-pointer transition-all duration-150 relative overflow-hidden"
                    >
                      {topic.isHot && (
                        <div className="absolute inset-0 bg-cyan-500/[0.02] group-hover/trend:bg-cyan-500/[0.05] transition-all"></div>
                      )}
                      <div className="flex items-center gap-2 relative z-10 truncate">
                        {topic.isHot ? (
                          <Zap className="w-2.5 h-2.5 text-cyan-400 animate-pulse shrink-0" />
                        ) : (
                          <span className="text-gray-600 group-hover/trend:text-cyan-400 transition-colors text-[9px] shrink-0 font-bold">#</span>
                        )}
                        <div className="flex flex-col truncate">
                          <span className="text-[10px] font-black tracking-tight text-white group-hover/trend:text-cyan-400 transition-colors truncate">
                            {topic.tag}
                          </span>
                          <span className="text-[7.5px] text-gray-450 leading-none">
                            {topic.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end relative z-10 shrink-0">
                        <span className="text-[8px] font-mono font-semibold text-gray-400 group-hover/trend:text-white transition-colors">
                          {topic.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* 2. STORIES TRAY SECTION */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[8.5px] font-mono font-bold uppercase tracking-wider text-gray-400">Stories</span>
          <span className="text-[7.5px] font-mono text-cyan-400">24H EPHEMERAL</span>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 px-1">
          {/* Create Own Story */}
          <div className="flex flex-col items-center shrink-0 group relative">
            <StoryAvatar userId={currentUser?.id || ''} size="md" onClickOverride={onOpenCreateMenu} />
            {uniqueUsersWithStories.every(u => u.user.id !== currentUser?.id) && (
              <div 
                onClick={onOpenCreateMenu}
                className="absolute bottom-4 right-0 w-3.5 h-3.5 bg-yellow-400 text-black border border-zinc-950 rounded-full flex items-center justify-center font-bold text-[8px] cursor-pointer pointer-events-auto shadow-md"
              >
                +
              </div>
            )}
            <span className="text-[7.5px] font-medium text-gray-500 truncate w-12 text-center mt-0.5">My Story</span>
          </div>

          {/* Render Active Stories */}
          {uniqueUsersWithStories
            .filter(item => item.user.id !== currentUser?.id)
            .map((item) => (
              <div
                key={item.user.id}
                className="flex flex-col items-center shrink-0 group"
              >
                <StoryAvatar userId={item.user.id} size="md" />
                <span className="text-[7.5px] font-semibold text-gray-300 truncate w-12 text-center mt-0.5 group-hover:text-yellow-400 transition-colors">
                  {item.user.displayName}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* 3. FEED FILTERS SECTION */}
      <div className="flex-col gap-1 flex border-b border-white/5 pb-1">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {(['All', 'Posts', 'Images', 'Reels', 'Videos'] as const).map((tab) => {
              const isActive = filter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => handleFilterChange(tab)}
                  className={`py-0.5 px-2.5 rounded-full text-[9px] font-bold transition-all cursor-pointer relative overflow-hidden shrink-0 ${
                    isActive 
                      ? 'bg-gradient-to-tr from-[#2563FF]/30 to-[#FF2E9A]/30 text-white border border-white/35 shadow-[0_4px_12px_rgba(37,99,255,0.25),inset_0_1px_1px_rgba(255,255,255,0.35)]' 
                      : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white border border-white/10'
                  }`}
                >
                  {/* Glass gloss shine on active */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                  )}
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Miniature interactive sandbox indicator */}
          <div className="flex items-center gap-1 py-0.5 px-2 bg-neutral-900 border border-white/5 rounded-full">
            <span className="text-[8px] font-mono text-gray-500 font-bold uppercase shrink-0">State:</span>
            <select 
              value={feedState}
              onChange={(e) => {
                const s = e.target.value as any;
                if (s === 'error') setErrorMessage('Gateway timeout during socket handshakes.');
                setFeedState(s);
              }}
              className="bg-transparent text-[9px] font-mono text-cyan-400 font-black uppercase outline-none cursor-pointer"
            >
              <option value="success" className="bg-black text-white">Live Success</option>
              <option value="loading" className="bg-black text-white">Shimmer Load</option>
              <option value="error" className="bg-black text-white">Error Guard</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. POSTS LIST FEED */}
      <div className="flex flex-col gap-2.5">
        {feedState === 'loading' ? (
          <SkeletonLoader variant="feed" count={3} />
        ) : feedState === 'error' ? (
          <ErrorState 
            message={errorMessage} 
            onRetry={() => {
              setFeedState('loading');
              setTimeout(() => setFeedState('success'), 700);
            }} 
            onRefresh={() => {
              setFeedState('loading');
              setTimeout(() => setFeedState('success'), 600);
            }}
          />
        ) : filteredPosts.length === 0 ? (
          <EmptyState 
            icon={AlertCircle}
            title={`No ${filter} found`}
            description={`We couldn't detect any live publications in the "${filter}" enclave database yet.`}
            actionLabel="Create Your First Post"
            onAction={onOpenCreateMenu}
            variant="pink"
          />
        ) : (
          filteredPosts.map((post) => {
            const reactionCount = Object.keys(post.reactions).length;
            const hasVoted = post.poll?.votedOptionIndex !== undefined;
            const currentUserReaction = currentUser ? post.reactions[currentUser.id] : undefined;


            return (
              <article 
                key={post.id} 
                className="liquid-glass-card rounded-xl p-2.5 border-white/10 relative shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
              >
                {/* Gloss Line Reflector */}
                <div className="absolute top-0 left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                {/* Post Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {/* Circle Avatar */}
                    <StoryAvatar userId={post.user.id} size="sm" />
                    <div>
                      <h3 
                        onClick={() => setViewedUserId(post.user.id)}
                        className="text-xs font-bold text-white tracking-tight leading-none mb-0.5 hover:text-yellow-400 transition-colors cursor-pointer"
                      >
                        {post.user.displayName}
                      </h3>
                      <span 
                        onClick={() => setViewedUserId(post.user.id)}
                        className="text-[7.5px] font-mono text-gray-500/90 tracking-wider hover:text-yellow-400 cursor-pointer transition-colors"
                      >
                        @{post.user.username} • {post.timestamp}
                      </span>
                    </div>
                  </div>
                  
                  {/* Connect quick context check & Floating Quick Share capsules */}
                  <div className="flex items-center gap-1.5">
                    {currentUser && post.user.id !== currentUser.id && (
                      <button 
                        onClick={() => {
                          const targetUser = users.find(u => u.id === post.user.id);
                          if (targetUser) selectChatUser(targetUser); 
                        }}
                        className="text-[7.5px] font-extrabold py-0.2 px-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-full transition-all text-[#2563FF] uppercase tracking-widest cursor-pointer whitespace-nowrap"
                      >
                        Connect
                      </button>
                    )}
                    
                    {/* Share icon feature remains functional but total public count is hidden */}
                  </div>
                </div>

                {/* Content Text */}
                <p className="text-[10px] leading-snug text-gray-200 mb-2 whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Render Media with Hover Glass Quick Share Overlay */}
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="rounded-lg overflow-hidden mb-2.5 border border-white/10 relative max-h-96 group">
                    <img 
                      src={post.mediaUrls[0]} 
                      alt="Post media" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    {/* Glossy overlay layer */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none"></div>
                    

                  </div>
                )}

                {/* Render Poll */}
                {post.mediaType === 'poll' && post.poll && (
                  <div className="bg-white/5 rounded-lg border border-white/10 p-2 mb-2 flex flex-col gap-2">
                    <span className="text-[9px] font-semibold text-gray-300 font-mono flex items-center gap-1.5">
                      <Vote className="w-3 h-3 text-cyan-400" /> Interactive Poll Selection:
                    </span>
                    <h4 className="text-[9.5px] font-bold text-white">{post.poll.question}</h4>
                    
                    <div className="flex flex-col gap-1">
                      {post.poll.options.map((option, idx) => {
                        const totalVotes = post.poll?.options.reduce((acc, curr) => acc + curr.votes, 0) || 1;
                        const percent = Math.round((option.votes / totalVotes) * 100);
                        const isThisChoice = post.poll?.votedOptionIndex === idx;

                        return (
                          <button
                            key={idx}
                            disabled={hasVoted}
                            onClick={() => voteInPoll(post.id, idx)}
                            className="w-full relative py-1.5 px-2.5 rounded-md text-left text-[9px] font-medium border border-white/10 transition-all overflow-hidden bg-black/40 group active:scale-[0.99] disabled:active:scale-100 cursor-pointer"
                          >
                            {/* Filling progress indicator */}
                            <div 
                              className={`absolute left-0 top-0 bottom-0 transition-all duration-700 pointer-events-none ${
                                isThisChoice 
                                  ? 'bg-cyan-500/20 border-r-2 border-cyan-400' 
                                  : 'bg-white/5'
                              }`}
                              style={{ width: `${percent}%` }}
                            ></div>

                            <div className="flex items-center justify-between relative z-10">
                              <span className={`grow text-left flex items-center gap-1.5 ${isThisChoice ? 'text-cyan-400 font-bold' : 'text-gray-300'}`}>
                                {option.text}
                                {isThisChoice && <Check className="w-3 h-3 text-cyan-400" />}
                              </span>
                              <span className="text-gray-400 font-mono font-bold">{percent}%</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Social Actions Panel */}
                <UnifiedSocialActionBar
                  item={post}
                  contentType={post.mediaType === 'text' ? 'writeup' : 'post'}
                  onOpenInsights={() => {
                    setInsightsPost(post);
                    setInsightsType(post.mediaType === 'text' ? 'writeup' : 'post');
                  }}
                  onOpenPromotion={() => {
                    setPromotionPost(post);
                    setPromotionType(post.mediaType === 'text' ? 'writeup' : 'post');
                  }}
                />

              </article>
            );
          })
        )}
      </div>

      {/* 6. EXPANDED COMMENTS MODAL TRAY */}
      {commentingPost && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 flex items-end justify-center select-none animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#0e142a] border-t border-white/15 rounded-t-3xl max-h-[75vh] flex flex-col shadow-2xl relative">
            
            {/* Close touch handle */}
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto my-3 cursor-pointer" onClick={() => setCommentingPost(null)}></div>
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-white/5">
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-white">Post Reactions & Comments</h4>
                <span className="text-5xs font-mono text-gray-400 tracking-wider">SECURE E2E COMMENT ENGINE</span>
              </div>
              <button 
                onClick={() => setCommentingPost(null)}
                className="p-1 rounded-full bg-white/5 text-gray-400 hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Comments list body */}
            <div className="flex-1 overflow-y-auto p-5 gap-4 flex flex-col custom-scrollbar">
              {/* Original Post Preview */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 mb-2 text-left">
                <span className="text-4xs font-mono text-cyan-400 font-semibold block mb-1">Original Post by @{commentingPost.user.username}</span>
                <p className="text-3xs text-gray-400 italic line-clamp-2">"{commentingPost.content}"</p>
              </div>

              {commentingPost.comments.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center gap-2">
                  <Smile className="w-8 h-8 text-gray-600 animate-bounce" />
                  <span className="text-xs text-gray-500 font-medium">Be the first to share your thoughts!</span>
                </div>
              ) : (
                commentingPost.comments.map((comm) => (
                  <div key={comm.id} className="flex gap-3 text-left">
                    <StoryAvatar 
                      userId={comm.user.id} 
                      size="sm" 
                      onClickOverride={() => { setViewedUserId(comm.user.id); setCommentingPost(null); }} 
                    />
                    <div className="flex-1 bg-white/5 border border-white/5 py-2 px-3 rounded-2xl">
                      <div className="flex items-center justify-between mb-1">
                        <span 
                          onClick={() => { setViewedUserId(comm.user.id); setCommentingPost(null); }}
                          className="text-3xs font-bold text-white leading-none cursor-pointer hover:text-yellow-400 transition-colors"
                        >
                          {comm.user.displayName}
                        </span>
                        <span className="text-5xs font-mono text-gray-500">
                          {comm.timestamp}
                        </span>
                      </div>
                      <p className="text-3xs text-gray-300 leading-normal">{comm.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Send Comment Input Bar */}
            <form onSubmit={handlePostCommentSubmit} className="border-t border-white/5 p-4 flex gap-2.5 bg-neutral-900/60 pb-8 rounded-b-none">
              <input
                type="text"
                placeholder="Share your response or thoughts..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 bg-[#101732] border border-white/10 focus:border-cyan-400 outline-none text-xs py-3 px-4 rounded-xl text-white placeholder:text-gray-500"
              />
              <button 
                type="submit"
                className="p-3 bg-gradient-to-r from-blue-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 active:scale-95 transition-all text-xs cursor-pointer shadow-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}

      {/* OVERLAY MODALS FOR INSIGHTS & PROMOTIONS */}
      <PostInsightsModal
        isOpen={insightsPost !== null}
        onClose={() => setInsightsPost(null)}
        contentItem={insightsPost}
        contentType={insightsType}
      />

      <PostPromotionModal
        isOpen={promotionPost !== null}
        onClose={() => setPromotionPost(null)}
        contentItem={promotionPost}
        contentType={promotionType}
        onBoostComplete={(postId, boostState) => {
          updatePostStats(postId, { boosts: boostState });
        }}
      />

      {/* LIQUID LINK HUB - FLOATING QUICK SHARE CUSTOMIZER */}
      <AnimatePresence>
        {activeSharePost && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            
            {/* Background Dismiss Trigger */}
            <div className="absolute inset-0" onClick={() => { triggerHaptic('light'); setActiveSharePost(null); }} />

            <motion.div
              initial={{ y: 50, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 40, scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-md liquid-glass-card-heavy rounded-[32px] p-6 text-left relative overflow-hidden flex flex-col gap-5 border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-10"
            >
              
              {/* Glossy top reflections */}
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              
              {/* Core neon colors backing layer for light dispersion */}
              <div className="absolute -top-20 -left-20 w-44 h-44 rounded-full bg-[#2563FF]/20 blur-[60px] pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-[#FF2E9A]/20 blur-[60px] pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-[#2563FF]/30 to-[#FF2E9A]/10 border border-white/15 shadow-[0_0_15px_rgba(37,99,255,0.25)]">
                    <Share2 className="w-4 h-4 text-[#2563FF] animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black font-display text-white uppercase tracking-wider">Liquid Link Hub</h3>
                    <p className="text-[10px] font-mono text-gray-400">iPhone 17 Pro Refractive Routing</p>
                  </div>
                </div>
                
                <button
                  onClick={() => { triggerHaptic('light'); setActiveSharePost(null); }}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Generated link preview panel */}
              <div className="bg-black/40 rounded-2xl p-4 border border-white/8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#2563FF]/2 via-transparent to-[#FF2E9A]/2 pointer-events-none" />
                
                <div className="flex justify-between items-start gap-3 relative z-10">
                  <div className="flex-1 min-w-0">
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-1">Generated custom destination:</span>
                    <p className="text-[11px] font-mono font-bold text-gray-200 select-all break-all leading-tight pr-1">
                      {generateDynamicLink(activeSharePost)}
                    </p>
                  </div>

                  {/* QR Scan Mini Visual */}
                  <div className="w-14 h-14 rounded-lg bg-white/[0.03] border border-white/10 p-1 flex items-center justify-center shrink-0">
                    <QrCode className="w-8 h-8 text-[#2563FF] drop-shadow-[0_0_8px_rgba(37,99,255,0.4)]" />
                  </div>
                </div>

                {/* Copied indicator banner */}
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] text-[#2563FF] font-black tracking-widest uppercase flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2563FF] animate-ping" />
                    Auto-synced to clipboard
                  </span>
                  
                  {shareClipboardCopied ? (
                    <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] bg-emerald-500/10 py-0.5 px-2 rounded-full border border-emerald-500/25 animate-bounce">
                      <Check className="w-3 h-3" /> Copied safely!
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-bold">
                      One-tap Active
                    </span>
                  )}
                </div>
              </div>

              {/* Interactive custom modifier checkboxes/sliders */}
              <div className="flex flex-col gap-2.5 relative z-10">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Customize Glass Routing Presets:</span>

                {/* signature toggle */}
                <div 
                  onClick={() => handleToggleOption('includeSignature')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all duration-300 ${
                    shareConfig.includeSignature 
                      ? 'bg-gradient-to-r from-[#2563FF]/8 to-transparent border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Fingerprint className={`w-4 h-4 ${shareConfig.includeSignature ? 'text-[#2563FF]' : 'text-gray-500'}`} />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-white leading-none">Include Creator Signature</span>
                      <span className="text-[9px] text-gray-400 font-mono">Binds signature of: @{activeSharePost.user.username}</span>
                    </div>
                  </div>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${shareConfig.includeSignature ? 'bg-[#2563FF]' : 'bg-gray-700'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white shadow transition-transform duration-300 ${shareConfig.includeSignature ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>

                {/* hifi glass refraction layer */}
                <div 
                  onClick={() => handleToggleOption('hifiGlassRefraction')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all duration-300 ${
                    shareConfig.hifiGlassRefraction 
                      ? 'bg-gradient-to-r from-[#FF2E9A]/8 to-transparent border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className={`w-4 h-4 ${shareConfig.hifiGlassRefraction ? 'text-[#FF2E9A]' : 'text-gray-500'}`} />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-white leading-none">VisionOS High-Index Layer</span>
                      <span className="text-[9px] text-gray-400 font-mono">Forces spatial glass blur viewport</span>
                    </div>
                  </div>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${shareConfig.hifiGlassRefraction ? 'bg-[#FF2E9A]' : 'bg-gray-700'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white shadow transition-transform duration-300 ${shareConfig.hifiGlassRefraction ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>

                {/* Specular telemetry */}
                <div 
                  onClick={() => handleToggleOption('includeTelemetry')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all duration-300 ${
                    shareConfig.includeTelemetry 
                      ? 'bg-gradient-to-r from-[#8B5CF6]/8 to-transparent border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Network className={`w-4 h-4 ${shareConfig.includeTelemetry ? 'text-[#8B5CF6]' : 'text-gray-500'}`} />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-white leading-none">iPhone 17 Specular Telemetry</span>
                      <span className="text-[9px] text-gray-400 font-mono">Injects real-time light alignment signals</span>
                    </div>
                  </div>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${shareConfig.includeTelemetry ? 'bg-[#8B5CF6]' : 'bg-gray-700'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white shadow transition-transform duration-300 ${shareConfig.includeTelemetry ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>

                {/* link shortener */}
                <div 
                  onClick={() => handleToggleOption('shortenLink')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all duration-300 ${
                    shareConfig.shortenLink 
                      ? 'bg-gradient-to-r from-emerald-500/8 to-transparent border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Link2 className={`w-4 h-4 ${shareConfig.shortenLink ? 'text-emerald-400' : 'text-gray-500'}`} />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-white leading-none">Compact Url Form</span>
                      <span className="text-[9px] text-gray-400 font-mono">Trims auxiliary trailing payload tags</span>
                    </div>
                  </div>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${shareConfig.shortenLink ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white shadow transition-transform duration-300 ${shareConfig.shortenLink ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>

              {/* Primary action capsules styling */}
              <div className="flex gap-3 mt-1 relative z-10">
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    const targetLink = generateDynamicLink(activeSharePost);
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(targetLink).then(() => {
                        setShareClipboardCopied(true);
                        triggerHaptic('success');
                        updatePostStats(activeSharePost.id, { shares: (activeSharePost.shares || 0) + 1 });
                        setActiveSharePost(prev => prev ? { ...prev, shares: (prev.shares || 0) + 1 } : null);
                        showToast("Custom specular link copied!");
                        setTimeout(() => setShareClipboardCopied(false), 3000);
                      });
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-xl liquid-glass-capsule-blue text-white font-extrabold text-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  <span>Copy Custom Link</span>
                </button>
                
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveSharePost(null);
                  }}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs border border-white/10 active:scale-95 transition-all cursor-pointer select-none"
                >
                  Dismiss
                </button>
              </div>

              {/* Ledgers footer */}
              <div className="text-[8px] font-mono text-center text-gray-600 leading-none select-none">
                ConnectX Specular Share Sync • Fully compatible with iOS 17 Pro AirDrop Matrix.
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK SHARE PREVIEW MODAL */}
      <AnimatePresence>
        {sharePreviewPost && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
            
            {/* Background Dismiss Trigger */}
            <div className="absolute inset-0" onClick={() => { triggerHaptic('light'); setSharePreviewPost(null); }} />

            <motion.div
              initial={{ y: 50, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 40, scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-sm liquid-glass-card-heavy rounded-[32px] p-6 text-left relative overflow-hidden flex flex-col gap-5 border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-10"
            >
              
              {/* Glossy top reflections */}
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              
              {/* Core neon colors backing layer for light dispersion */}
              <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-[#FF2E9A]/20 blur-[50px] pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-[#2563FF]/20 blur-[50px] pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-[#2563FF]/30 to-[#FF2E9A]/10 border border-white/15 shadow-[0_0_15px_rgba(37,99,255,0.25)]">
                    <Share2 className="w-4 h-4 text-[#FF2E9A] animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black font-display text-white uppercase tracking-wider">Share Preview</h3>
                    <p className="text-[9px] font-mono text-gray-400">Dynamic OpenGraph Specimen</p>
                  </div>
                </div>
                
                <button
                  onClick={() => { triggerHaptic('light'); setSharePreviewPost(null); }}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* METADATA RICH LINK PREVIEW CARD MOCKUP */}
              <div className="relative rounded-2xl bg-[#090b16] border border-white/10 overflow-hidden shadow-lg select-none group">
                {/* Thin gloss outline reflect line */}
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent z-10" />
                
                {/* Media Image or Dynamic Waveform Branding graphic */}
                {sharePreviewPost.mediaUrls && sharePreviewPost.mediaUrls.length > 0 ? (
                  <div className="w-full h-40 overflow-hidden relative border-b border-white/5 bg-black/60 flex items-center justify-center">
                    <img 
                      src={sharePreviewPost.mediaUrls[0]} 
                      alt="Metadata preview" 
                      className="w-full h-full object-cover blur-[1px] brightness-90 group-hover:blur-0 group-hover:scale-105 transition-all duration-700" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090b16] via-transparent to-transparent opacity-80" />
                  </div>
                ) : (
                  <div className="w-full h-32 relative border-b border-white/5 overflow-hidden flex flex-col justify-between p-4 bg-gradient-to-b from-[#11162d] to-[#090b16]">
                    {/* Animated background lines */}
                    <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                    <div className="absolute -top-12 -left-12 w-28 h-28 rounded-full bg-[#2563FF]/15 blur-2xl" />
                    <div className="absolute -bottom-12 -right-12 w-28 h-28 rounded-full bg-[#FF2E9A]/15 blur-2xl" />
                    
                    <div className="flex items-center gap-1.5 z-10">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#2563FF] to-[#FF2E9A] flex items-center justify-center font-display font-extrabold text-xs text-white">X</div>
                      <span className="text-[8px] font-black tracking-widest text-[#FF2E9A] uppercase font-mono">ConnectX Spatial Net</span>
                    </div>

                    <div className="z-10 bg-white/[0.03] backdrop-blur-md rounded-lg p-2 border border-white/5 flex items-center gap-2">
                       <Fingerprint className="w-4 h-4 text-[#2563FF] animate-pulse" />
                       <span className="text-[9px] font-mono text-gray-400">Cryp-Signed Creator Ledger Card</span>
                    </div>
                  </div>
                )}

                {/* Metadata Details Bottom Drawer Section */}
                <div className="p-4 flex flex-col gap-1.5 bg-[#090b16]/70 backdrop-blur-md relative">
                  <div className="flex items-center gap-1.5 mb-1">
                    <img 
                      src={sharePreviewPost.user.avatarUrl || MOCK_AVATARS[0]} 
                      alt="User mini avatar" 
                      className="w-5 h-5 rounded-full border border-white/10 ring-1 ring-[#2563FF]/20"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[10px] font-bold text-gray-300">
                      ConnectX Post • @{sharePreviewPost.user.username}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-white hover:text-[#2563FF] transition-colors leading-snug tracking-tight truncate-two-lines">
                    ConnectX Post by @{sharePreviewPost.user.username}
                  </h4>

                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed line-clamp-2 h-7 overflow-hidden text-ellipsis mb-1.5">
                    {sharePreviewPost.content ? (sharePreviewPost.content.length > 80 ? `${sharePreviewPost.content.substring(0, 77)}...` : sharePreviewPost.content) : "Interactive digital card share feed item on ConnectX."}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[9px] font-black text-[#2563FF] font-mono tracking-wider uppercase flex items-center gap-1">
                      <Link2 className="w-3 h-3 text-[#2563FF]/80" />
                      connectx.app
                    </span>
                    <span className="text-[8px] font-mono text-gray-400">
                      SECURE HTTPS GATEWAY
                    </span>
                  </div>
                </div>
              </div>

              {/* Explanation note */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex gap-2 w-full">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400 font-bold leading-normal">
                  ConnectX generates deep-linked refractive glass schemas. Tap the trigger to activate native platform system-sharing.
                </p>
              </div>

              {/* ACTION BUTTON CHEVRONS */}
              <div className="flex gap-3 relative z-10">
                <button
                  onClick={() => executeSharingDialog(sharePreviewPost)}
                  className="flex-1 py-3 px-4 rounded-xl liquid-glass-capsule-pink text-white font-black text-xs cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(255,46,154,0.3)] hover:scale-102 active:scale-98 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Execute Share Dialog</span>
                </button>
                
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setSharePreviewPost(null);
                  }}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs border border-white/10 active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIQUID GLASS TOAST SYSTEM */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 350 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
          >
            <div className="liquid-glass-card-heavy px-5 py-3.5 rounded-2xl flex items-center gap-3 border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-2xl max-w-sm relative overflow-hidden">
              {/* Gloss gloss shine */}
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              {/* Neon color core backing glow */}
              <div className="absolute -bottom-6 -right-6 w-12 h-12 rounded-full bg-[#FF2E9A]/20 blur-md pointer-events-none" />
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-[#2563FF]/20 blur-md pointer-events-none" />

              <div className="p-1.5 rounded-xl bg-gradient-to-tr from-[#2563FF]/30 to-[#FF2E9A]/20 border border-white/15 shadow-[0_0_12px_rgba(37,99,255,0.2)] shrink-0 relative z-10">
                <Check className="w-3.5 h-3.5 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              </div>
              <span className="text-xs font-black text-gray-100 tracking-wide select-none shrink-0 relative z-10 block pr-2">
                {activeToast.message}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
